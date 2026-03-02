import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

// Get all templates
export const getAllTemplates = asyncHandler(async (req, res) => {
  const query = `
    SELECT t.*, e.employeeName AS createdByName,
      (SELECT COUNT(*) FROM stage_template_item WHERE templateId = t.templateId) AS itemCount
    FROM stage_template t
    LEFT JOIN employee e ON t.createdBy = e.employeeId
    ORDER BY t.timestamp DESC`

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error retrieving templates:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error retrieving templates'))
    }
    res
      .status(200)
      .json(new ApiResponse(200, data, 'Templates retrieved successfully.'))
  })
})

// Get template by ID with all items
export const getTemplateById = asyncHandler(async (req, res) => {
  const templateId = req.params.id

  const templateQuery = `
    SELECT t.*, e.employeeName AS createdByName
    FROM stage_template t
    LEFT JOIN employee e ON t.createdBy = e.employeeId
    WHERE t.templateId = ?`

  const itemsQuery = `
    SELECT * FROM stage_template_item 
    WHERE templateId = ? 
    ORDER BY orderIndex ASC`

  db.query(templateQuery, [templateId], (err, templateData) => {
    if (err) {
      console.error('Error retrieving template:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error retrieving template'))
    }

    if (templateData.length === 0) {
      return res.status(404).json(new ApiError(404, 'Template not found'))
    }

    db.query(itemsQuery, [templateId], (err, itemsData) => {
      if (err) {
        console.error('Error retrieving template items:', err)
        return res
          .status(500)
          .json(new ApiError(500, 'Error retrieving template items'))
      }

      const template = {
        ...templateData[0],
        items: itemsData,
      }

      res
        .status(200)
        .json(
          new ApiResponse(200, template, 'Template retrieved successfully.')
        )
    })
  })
})

// Create template with items (transactional)
export const createTemplate = asyncHandler(async (req, res) => {
  const { templateName, description, items } = req.body

  if (!templateName) {
    return res
      .status(400)
      .json(new ApiError(400, 'Template name is required'))
  }

  const templateQuery = `
    INSERT INTO stage_template (templateName, description, createdBy)
    VALUES (?, ?, ?)`

  const itemQuery = `
    INSERT INTO stage_template_item (templateId, stageName, machine, duration, orderIndex, parentItemId)
    VALUES (?, ?, ?, ?, ?, ?)`

  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error starting transaction'))
    }

    // Insert template
    db.query(
      templateQuery,
      [templateName, description || null, req.user[0].employeeId],
      (err, templateResult) => {
        if (err) {
          console.error('Template Insert Error:', err)
          return db.rollback(() => {
            res
              .status(500)
              .json(new ApiError(500, 'Error creating template'))
          })
        }

        const templateId = templateResult.insertId
        const parsedItems =
          typeof items === 'string' ? JSON.parse(items) : items || []

        if (parsedItems.length === 0) {
          // No items, just commit
          return db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res
                  .status(500)
                  .json(new ApiError(500, 'Error committing transaction'))
              })
            }
            res
              .status(201)
              .json(
                new ApiResponse(
                  201,
                  { templateId, templateName, description, items: [] },
                  'Template created successfully.'
                )
              )
          })
        }

        // Insert items — handle parent-child relationships using a tempId mapping
        const insertItems = async () => {
          const tempIdToRealId = {}

          for (let i = 0; i < parsedItems.length; i++) {
            const item = parsedItems[i]
            const parentItemId = item.parentItemId
              ? tempIdToRealId[item.parentItemId] || null
              : null

            const values = [
              templateId,
              item.stageName,
              item.machine || null,
              item.duration || null,
              item.orderIndex || i,
              parentItemId,
            ]

            const result = await new Promise((resolve, reject) => {
              db.query(itemQuery, values, (err, result) => {
                if (err) reject(err)
                else resolve(result)
              })
            })

            // Map tempId to real insertId
            if (item.tempId) {
              tempIdToRealId[item.tempId] = result.insertId
            }
          }
        }

        insertItems()
          .then(() => {
            db.commit((err) => {
              if (err) {
                console.error('Commit Error:', err)
                return db.rollback(() => {
                  res
                    .status(500)
                    .json(new ApiError(500, 'Error committing transaction'))
                })
              }
              res
                .status(201)
                .json(
                  new ApiResponse(
                    201,
                    { templateId, templateName, description },
                    'Template created successfully.'
                  )
                )
            })
          })
          .catch((err) => {
            console.error('Items Insert Error:', err)
            db.rollback(() => {
              res
                .status(500)
                .json(new ApiError(500, 'Error creating template items'))
            })
          })
      }
    )
  })
})

// Update template (name, description + replace all items)
export const updateTemplate = asyncHandler(async (req, res) => {
  const templateId = req.params.id
  const { templateName, description, items } = req.body

  if (!templateName) {
    return res
      .status(400)
      .json(new ApiError(400, 'Template name is required'))
  }

  const updateTemplateQuery = `
    UPDATE stage_template SET templateName = ?, description = ?
    WHERE templateId = ?`

  const deleteItemsQuery = `DELETE FROM stage_template_item WHERE templateId = ?`

  const itemQuery = `
    INSERT INTO stage_template_item (templateId, stageName, machine, duration, orderIndex, parentItemId)
    VALUES (?, ?, ?, ?, ?, ?)`

  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .json(new ApiError(500, 'Error starting transaction'))
    }

    // Update template metadata
    db.query(
      updateTemplateQuery,
      [templateName, description || null, templateId],
      (err) => {
        if (err) {
          return db.rollback(() => {
            res
              .status(500)
              .json(new ApiError(500, 'Error updating template'))
          })
        }

        // Delete all existing items
        db.query(deleteItemsQuery, [templateId], (err) => {
          if (err) {
            return db.rollback(() => {
              res
                .status(500)
                .json(new ApiError(500, 'Error deleting old template items'))
            })
          }

          const parsedItems =
            typeof items === 'string' ? JSON.parse(items) : items || []

          if (parsedItems.length === 0) {
            return db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res
                    .status(500)
                    .json(new ApiError(500, 'Error committing transaction'))
                })
              }
              res
                .status(200)
                .json(
                  new ApiResponse(200, { templateId }, 'Template updated successfully.')
                )
            })
          }

          // Re-insert items
          const insertItems = async () => {
            const tempIdToRealId = {}

            for (let i = 0; i < parsedItems.length; i++) {
              const item = parsedItems[i]
              const parentItemId = item.parentItemId
                ? tempIdToRealId[item.parentItemId] || null
                : null

              const values = [
                templateId,
                item.stageName,
                item.machine || null,
                item.duration || null,
                item.orderIndex || i,
                parentItemId,
              ]

              const result = await new Promise((resolve, reject) => {
                db.query(itemQuery, values, (err, result) => {
                  if (err) reject(err)
                  else resolve(result)
                })
              })

              if (item.tempId) {
                tempIdToRealId[item.tempId] = result.insertId
              }
            }
          }

          insertItems()
            .then(() => {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res
                      .status(500)
                      .json(new ApiError(500, 'Error committing transaction'))
                  })
                }
                res
                  .status(200)
                  .json(
                    new ApiResponse(
                      200,
                      { templateId },
                      'Template updated successfully.'
                    )
                  )
              })
            })
            .catch((err) => {
              console.error('Items Insert Error:', err)
              db.rollback(() => {
                res
                  .status(500)
                  .json(new ApiError(500, 'Error updating template items'))
              })
            })
        })
      }
    )
  })
})

// Delete template (cascade deletes items)
export const deleteTemplate = asyncHandler(async (req, res) => {
  const templateId = req.params.id

  const query = 'DELETE FROM stage_template WHERE templateId = ?'
  db.query(query, [templateId], (err, result) => {
    if (err) {
      console.error('Error deleting template:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error deleting template'))
    }
    if (result.affectedRows === 0) {
      return res.status(404).json(new ApiError(404, 'Template not found'))
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, templateId, 'Template deleted successfully.')
      )
  })
})

// Apply template to a project — creates ONLY substages (stages already exist from form)
export const applyTemplate = asyncHandler(async (req, res) => {
  const templateId = req.params.id
  const { projectNumber } = req.body

  if (!projectNumber) {
    return res
      .status(400)
      .json(new ApiError(400, 'projectNumber is required'))
  }

  // 1. Get template items
  const itemsQuery = `
    SELECT * FROM stage_template_item 
    WHERE templateId = ? 
    ORDER BY orderIndex ASC`

  // 2. Get existing stages for this project (already created by addProject)
  const stagesQuery = `
    SELECT stageId, stageName FROM stage 
    WHERE projectNumber = ? AND historyOf IS NULL`

  const substageInsertQuery = `
    INSERT INTO substage (stageId, parentSubstageId, substageName, startDate, endDate, owner, machine, duration, createdBy, progress, projectNumber, isCompleted)
    VALUES (?, ?, ?, CURDATE(), CURDATE(), ?, ?, ?, ?, 0, ?, 0)`

  db.query(itemsQuery, [templateId], (err, items) => {
    if (err) {
      console.error('Error retrieving template items:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error retrieving template items'))
    }

    if (items.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Template has no items to apply.'))
    }

    // Get existing stages
    db.query(stagesQuery, [projectNumber], (err, existingStages) => {
      if (err) {
        console.error('Error retrieving stages:', err)
        return res
          .status(500)
          .json(new ApiError(500, 'Error retrieving project stages'))
      }

      const createdBy = req.user[0].employeeId

      // Map template top-level items to existing stage IDs by name
      const topLevelItems = items.filter((i) => !i.parentItemId)
      const childItems = items.filter((i) => i.parentItemId)

      // If no child items, nothing to create
      if (childItems.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, 'No substages to create from template.'))
      }

      // Build mapping: templateItemId -> stageId (for top-level items)
      const itemIdMap = {}
      for (const tItem of topLevelItems) {
        const matchingStage = existingStages.find(
          (s) => s.stageName.toLowerCase().trim() === tItem.stageName.toLowerCase().trim()
        )
        if (matchingStage) {
          itemIdMap[tItem.itemId] = { type: 'stage', realId: matchingStage.stageId }
        }
      }

      db.beginTransaction(async (err) => {
        if (err) {
          return res
            .status(500)
            .json(new ApiError(500, 'Error starting transaction'))
        }

        try {
          // Insert child items as substages (multi-pass for nested)
          let remaining = [...childItems]
          let maxPasses = 10
          let substagesCreated = 0

          while (remaining.length > 0 && maxPasses > 0) {
            const nextRemaining = []
            for (const item of remaining) {
              const parentMapping = itemIdMap[item.parentItemId]
              if (!parentMapping) {
                nextRemaining.push(item)
                continue
              }

              let stageId, parentSubstageId
              if (parentMapping.type === 'stage') {
                stageId = parentMapping.realId
                parentSubstageId = null
              } else {
                stageId = parentMapping.stageId
                parentSubstageId = parentMapping.realId
              }

              const result = await new Promise((resolve, reject) => {
                db.query(
                  substageInsertQuery,
                  [
                    stageId,
                    parentSubstageId,
                    item.stageName,
                    createdBy, // owner
                    item.machine || '', // machine (NOT NULL)
                    item.duration || 0, // duration (NOT NULL)
                    createdBy, // createdBy
                    projectNumber,
                  ],
                  (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                  }
                )
              })
              itemIdMap[item.itemId] = {
                type: 'substage',
                realId: result.insertId,
                stageId: stageId,
              }
              substagesCreated++
            }
            remaining = nextRemaining
            maxPasses--
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res
                  .status(500)
                  .json(new ApiError(500, 'Error committing transaction'))
              })
            }

            res.status(200).json(
              new ApiResponse(
                200,
                { projectNumber, substagesCreated },
                'Template substages created successfully.'
              )
            )
          })
        } catch (err) {
          console.error('Apply Template Error:', err)
          db.rollback(() => {
            res
              .status(500)
              .json(new ApiError(500, 'Error applying template'))
          })
        }
      })
    })
  })
})


