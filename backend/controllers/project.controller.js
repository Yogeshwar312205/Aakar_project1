import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'
// Get Company List
export const getCompanyList = asyncHandler(async (req, res) => {
  const query = 'SELECT DISTINCT companyName FROM project'

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error retrieving company names:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error retrieving company names'))
    }
    const companyList = data.map((item) => item.companyName)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          companyList,
          'Company names retrieved successfully.'
        )
      )
  })
})

// Get all projects
export const getAllProjects = asyncHandler(async (req, res) => {
  const query = 'SELECT * FROM project'

  db.query(query, (err, data) => {
    if (err) {
      const error = new ApiError(400, 'Error retrieving projects')
      return res.status(400).json(error)
    }

    // Convert UTC dates to local time and format as YYYY-MM-DD
    const projects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: project.executedStartDate
        ? new Date(project.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: project.executedEndDate
        ? new Date(project.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))

    // Send the response with the modified date formats
    res
      .status(200)
      .json(new ApiResponse(200, projects, 'Projects retrieved successfully.'))
  })
})

// get active projects
export const getActiveProjects = asyncHandler(async (req, res) => {
  try {
    // 1. Normalize "Pending" and "In Progress" to "Ongoing"
    await db.promise().query(
      `UPDATE project SET projectStatus = 'Ongoing' WHERE projectStatus IN ('Pending', 'In Progress') AND historyOf IS NULL`
    )

    // 2. Auto-detect overdue: endDate passed, not completed, not already overdue
    await db.promise().query(
      `UPDATE project SET projectStatus = 'Overdue' WHERE endDate < CURDATE() AND progress < 100 AND projectStatus NOT IN ('Completed', 'Overdue') AND historyOf IS NULL`
    )

    // 3. Revert overdue to ongoing if endDate was extended or progress completed
    await db.promise().query(
      `UPDATE project SET projectStatus = 'Ongoing' WHERE projectStatus = 'Overdue' AND endDate >= CURDATE() AND progress < 100 AND historyOf IS NULL`
    )

    // 3. Fetch active projects
    const [data] = await db.promise().query(
      'SELECT * FROM project WHERE historyOf IS NULL'
    )

    // Convert UTC dates to local time and format as YYYY-MM-DD
    const activeProjects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: project.executedStartDate
        ? new Date(project.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: project.executedEndDate
        ? new Date(project.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activeProjects,
          'Active projects retrieved successfully.'
        )
      )
  } catch (err) {
    console.error('Error retrieving active projects:', err)
    return res.status(400).json(new ApiError(400, 'Error retrieving active projects'))
  }
})

// get history projects whose historyOf == pNo
export const getHistoricalProjects = asyncHandler(async (req, res) => {
  const pNo = req.params.pNo
  const query =
    'SELECT * FROM project WHERE historyOf = ? ORDER BY projectNumber DESC'

  db.query(query, [pNo], (err, data) => {
    if (err) {
      const error = new ApiError(400, 'Error retrieving historical projects')
      return res.status(400).json(error)
    }

    // Convert UTC dates to local time and format as YYYY-MM-DD
    const historicalProjects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: project.executedStartDate
        ? new Date(project.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: project.executedEndDate
        ? new Date(project.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          historicalProjects,
          `Historical projects for project number ${pNo} retrieved successfully.`
        )
      )
  })
})

// Get project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id
  const query = 'SELECT * FROM project WHERE projectNumber = ?'

  db.query(query, [projectNumber], (err, data) => {
    if (err) {
      res.status(500).json(new ApiError(500, 'Error retrieving project'))
      return
    }
    if (data.length === 0) {
      res.status(500).json(new ApiError(500, 'Project not found'))
      return
    }
    const projects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: project.executedStartDate
        ? new Date(project.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: project.executedEndDate
        ? new Date(project.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(
        new ApiResponse(200, projects[0], 'Projects retrieved successfully.')
      )
  })
})

// Create a new project
export const createProject = asyncHandler(async (req, res) => {
  console.log(req.user)
  const projectQuery = `INSERT INTO project (
    projectNumber, companyName, dieName, dieNumber, projectStatus, startDate, endDate,
    projectType, projectPOLink, projectDesignDocLink, projectCreatedBy, progress
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const stageQuery = `INSERT INTO stage (
    projectNumber, stageName, startDate, endDate, owner, machine, duration, 
    seqPrevStage, createdBy, progress
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const updateStageQuery = `UPDATE stage
    SET seqPrevStage = ?
    WHERE stageId = ?`

  const projectPOLink = req.files?.projectPOLink
    ? req.files.projectPOLink[0].filename
    : null
  const projectDesignDocLink = req.files?.projectDesignDocLink
    ? req.files.projectDesignDocLink[0].filename
    : null

  const projectValues = [
    req.body.projectNumber,
    req.body.companyName,
    req.body.dieName,
    req.body.dieNumber,
    req.body.projectStatus,
    req.body.startDate || null,
    req.body.endDate || null,
    req.body.projectType,
    projectPOLink,
    projectDesignDocLink,
    req.user[0].employeeId,
    req.body.progress,
  ]

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error starting transaction'))
    }

    // Insert into project table
    db.query(projectQuery, projectValues, (err, result) => {
      if (err) {
        console.error('Project Insert Error:', err)
        return db.rollback(() => {
          res.status(500).json(new ApiError(500, 'Error creating project'))
        })
      }

      const projectNumber = req.body.projectNumber
      let stages = req.body.stages

      if (typeof stages === 'string') {
        try {
          stages = JSON.parse(stages)
        } catch (parseError) {
          console.error('Stages Parse Error:', parseError)
          return db.rollback(() => {
            res.status(400).json(new ApiError(400, 'Invalid stages format'))
          })
        }
      }

      stages = stages || [] // Default to empty array if undefined

      // Insert each stage
      const today = new Date().toISOString().split('T')[0]
      const stageInserts = stages.map((stage) => {
        return new Promise((resolve, reject) => {
          // Extract customEmployeeId from owner field
          const ownerStr = stage.owner || ''
          const match = ownerStr.match(/\(([^)]+)\)/) // Extracts customEmployeeId
          const customEmployeeId = match ? match[1] : null

          // If no owner provided, insert stage with null owner
          if (!customEmployeeId) {
            const stageValues = [
              projectNumber,
              stage.stageName,
              stage.startDate || today,
              stage.endDate || today,
              null, // No owner
              stage.machine || '',
              stage.duration || 0,
              null, // seqPrevStage will be updated later
              req.user[0].employeeId,
              stage.progress || 0,
            ]

            db.query(stageQuery, stageValues, (err, result) => {
              if (err) {
                reject(err)
              } else {
                const stageId = result.insertId
                stage.stageId = stageId
                resolve(stage)
              }
            })
            return
          }

          // Query to find the corresponding employeeId
          const employeeQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
          db.query(employeeQuery, [customEmployeeId], (err, employeeResult) => {
            if (err || employeeResult.length === 0) {
              reject(new Error('Employee not found for customEmployeeId.'))
              return
            }

            const employeeId = employeeResult[0].employeeId

            // Prepare stage values with the correct employeeId as owner
            const stageValues = [
              projectNumber,
              stage.stageName,
              stage.startDate || today,
              stage.endDate || today,
              employeeId, // Use employeeId instead of customEmployeeId
              stage.machine || '',
              stage.duration || 0,
              null, // seqPrevStage will be updated later
              req.user[0].employeeId,
              stage.progress || 0,
            ]

            db.query(stageQuery, stageValues, (err, result) => {
              if (err) {
                reject(err)
              } else {
                const stageId = result.insertId
                stage.stageId = stageId
                resolve(stage)
              }
            })
          })
        })
      })

      Promise.all(stageInserts)
        .then((insertedStages) => {
          const updatePromises = insertedStages.map((stage, index) => {
            if (index > 0) {
              const previousStageId = insertedStages[index - 1].stageId
              return new Promise((resolve, reject) => {
                db.query(
                  updateStageQuery,
                  [previousStageId, stage.stageId],
                  (err) => {
                    if (err) {
                      reject(err)
                    } else {
                      resolve()
                    }
                  }
                )
              })
            }
            return Promise.resolve()
          })

          return Promise.all(updatePromises).then(() => insertedStages)
        })
        .then((insertedStages) => {
          // Now insert substages for each stage
          const substageQuery = `INSERT INTO substage (
            stageId, projectNumber, substageName, startDate, endDate, owner, 
            machine, duration, createdBy, progress, parentSubstageId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

          // Helper function to get employeeId from owner string
          const getEmployeeId = (ownerStr) => {
            return new Promise((resolve, reject) => {
              if (!ownerStr) {
                resolve(null)
                return
              }
              const match = ownerStr.match(/\(([^)]+)\)/)
              const customEmployeeId = match ? match[1] : null
              if (!customEmployeeId) {
                resolve(null)
                return
              }
              const employeeQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
              db.query(employeeQuery, [customEmployeeId], (err, result) => {
                if (err || result.length === 0) {
                  resolve(null)
                } else {
                  resolve(result[0].employeeId)
                }
              })
            })
          }

          // Recursive function to insert substages
          const insertSubstagesRecursive = async (substages, stageId, parentSubstageId = null) => {
            if (!substages || substages.length === 0) return []

            const insertedSubstages = []
            const today = new Date().toISOString().split('T')[0]
            for (const substage of substages) {
              const employeeId = await getEmployeeId(substage.owner)
              const substageValues = [
                stageId,
                projectNumber,
                substage.substageName || substage.stageName || '',
                substage.startDate || today,
                substage.endDate || today,
                employeeId || req.user[0].employeeId, // Default to createdBy if no owner
                substage.machine || '',
                substage.duration || 0,
                req.user[0].employeeId,
                substage.progress || 0,
                parentSubstageId,
              ]

              const insertedSubstage = await new Promise((resolve, reject) => {
                db.query(substageQuery, substageValues, (err, result) => {
                  if (err) {
                    console.error('Substage insert error:', err)
                    reject(err)
                  } else {
                    resolve({ ...substage, substageId: result.insertId })
                  }
                })
              })

              insertedSubstages.push(insertedSubstage)

              // Recursively insert child substages
              if (substage.substages && substage.substages.length > 0) {
                await insertSubstagesRecursive(
                  substage.substages,
                  stageId,
                  insertedSubstage.substageId
                )
              }
            }
            return insertedSubstages
          }

          // Insert substages for all stages
          const allSubstageInserts = insertedStages.map((stage) => {
            if (stage.substages && stage.substages.length > 0) {
              return insertSubstagesRecursive(stage.substages, stage.stageId, null)
            }
            return Promise.resolve([])
          })

          return Promise.all(allSubstageInserts)
        })
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
                  req.body,
                  'Project, stages, and substages created successfully.'
                )
              )
          })
        })
        .catch((err) => {
          console.error('Stages/Substages Insert Error:', err)
          db.rollback(() => {
            res.status(500).json(new ApiError(500, 'Error creating stages or substages'))
          })
        })
    })
  })
})

// Delete a project
export const deleteProject = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id

  const deleteStagesQuery = 'DELETE FROM stage WHERE projectNumber = ?'
  const deleteProjectQuery =
    'DELETE FROM project WHERE projectNumber = ? OR historyOf= ?'

  db.query(deleteStagesQuery, [projectNumber], (stageErr) => {
    if (stageErr) {
      console.error(stageErr)
      return res.status(500).json({ error: 'Error deleting associated stages' })
    }

    db.query(
      deleteProjectQuery,
      [projectNumber, projectNumber],
      (projectErr) => {
        if (projectErr) {
          console.error(projectErr)
          return res.status(500).json({ error: 'Error deleting project' })
        }

        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              projectNumber,
              'Project and associated stages deleted successfully.'
            )
          )
      }
    )
  })
})

// Update project and store history
export const updateProject = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id
  // console.log(req.body)

  // Query to select the current project data
  const selectQuery = `SELECT * FROM project WHERE projectNumber = ?`

  const countHistoryQuery = `SELECT COUNT(*) AS historyCount FROM project WHERE historyOf = ?`

  const insertQuery = `INSERT INTO project (
    projectNumber, companyName, dieName, dieNumber, projectStatus, startDate, endDate, 
    projectType, projectPOLink, projectDesignDocLink, projectCreatedBy, progress, 
    historyOf, updateReason
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  // Query to update the project
  const updateQuery = `UPDATE project SET 
    companyName = ?, dieName = ?, dieNumber = ?, projectStatus = ?, 
    startDate = ?, endDate = ?, projectType = ?, projectPOLink = ?, 
    projectDesignDocLink = ?, projectCreatedBy = ?, progress = ?,
    timestamp = ?, historyOf = NULL
    WHERE projectNumber = ?`

  db.query(selectQuery, [projectNumber], (err, projectData) => {
    if (err) {
      console.log(err)
      return res.status(500).send(new ApiError(500, 'Error retrieving project'))
    }

    if (projectData.length === 0) {
      return res.status(404).send(new ApiError(404, 'Project not found'))
    }

    const project = projectData[0]

    // Check if any changes are made
    const isChanged = Object.keys(req.body).some(
      (key) => project[key] !== req.body[key]
    )

    if (!isChanged) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, 'No changes detected. No action taken.')
        )
    }

    // Count the number of history records for this project
    db.query(countHistoryQuery, [projectNumber], (err, countData) => {
      if (err) {
        console.log(err)
        return res
          .status(500)
          .send(new ApiError(500, 'Error retrieving history count'))
      }

      const historyCount = countData[0].historyCount // Get the number of history entries
      const prefix = String(historyCount + 1).padStart(4, '0') // Generate a 4-digit prefix like 0001, 0002, etc.
      const paddedProjectNumber = String(projectNumber).padStart(7, '0') // Ensure projectNumber is 7 digits (e.g., 0000001)
      const newProjectNumber = prefix + paddedProjectNumber // Combine the history count prefix and the original project number

      // Insert the existing project into history before updating
      const insertValues = [
        newProjectNumber, // The new projectNumber for the history entry
        project.companyName,
        project.dieName,
        project.dieNumber,
        project.projectStatus,
        project.startDate,
        project.endDate,
        project.projectType,
        project.projectPOLink,
        project.projectDesignDocLink,
        project.projectCreatedBy,
        project.progress,
        projectNumber, // historyOf should store the original projectNumber
        req.body.updateReason, // Pass the reason for the update
      ]

      db.query(insertQuery, insertValues, (err, insertData) => {
        if (err) {
          console.log(err)
          return res
            .status(500)
            .send(new ApiError(500, 'Error creating project history'))
        }

        // Keep existing links if no new file is provided
        const projectPOLink = req.files?.projectPOLink
          ? req.files.projectPOLink[0].filename
          : project.projectPOLink
        const projectDesignDocLink = req.files?.projectDesignDocLink
          ? req.files.projectDesignDocLink[0].filename
          : project.projectDesignDocLink

        // Update the project with new values
        const timestamp = new Date(req.body.timestamp)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', '')
        const updateValues = [
          req.body.companyName,
          req.body.dieName,
          req.body.dieNumber,
          req.body.projectStatus,
          req.body.startDate,
          req.body.endDate,
          req.body.projectType,
          projectPOLink,
          projectDesignDocLink,
          req.user[0].employeeId,
          req.body.progress,
          timestamp,
          projectNumber, // The original projectNumber for updating the project
        ]

        db.query(updateQuery, updateValues, (err, updateData) => {
          if (err) {
            console.log(err)
            return res
              .status(500)
              .send(new ApiError(500, 'Error updating project'))
          }

          res
            .status(200)
            .json(
              new ApiResponse(200, updateData, 'Project updated successfully.')
            )
        })
      })
    })
  })
})

// Get full project history (all stage + substage changes)
export const getProjectHistory = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id

  // Get current project
  const projectQuery = `
    SELECT p.*, e.employeeName as projectCreatedByName
    FROM project p
    LEFT JOIN employee e ON p.projectCreatedBy = e.employeeId
    WHERE p.projectNumber = ? AND p.historyOf IS NULL
  `

  // Get project history versions
  const projectHistoryQuery = `
    SELECT p.*, e.employeeName as projectCreatedByName
    FROM project p
    LEFT JOIN employee e ON p.projectCreatedBy = e.employeeId
    WHERE p.historyOf = ?
    ORDER BY p.timestamp DESC
  `

  // Get active stages for this project
  const activeStagesQuery = `
    SELECT s.*, 
      eo.employeeName AS ownerName, 
      cb.employeeName AS createdByName
    FROM stage s
    LEFT JOIN employee eo ON s.owner = eo.employeeId
    LEFT JOIN employee cb ON s.createdBy = cb.employeeId
    WHERE s.projectNumber = ? AND s.historyOf IS NULL
    ORDER BY s.seqPrevStage ASC
  `

  // Get all stage history records for this project
  const stageHistoryQuery = `
    SELECT s.*, 
      eo.employeeName AS ownerName, 
      cb.employeeName AS createdByName
    FROM stage s
    LEFT JOIN employee eo ON s.owner = eo.employeeId
    LEFT JOIN employee cb ON s.createdBy = cb.employeeId
    WHERE s.projectNumber = ? AND s.historyOf IS NOT NULL
    ORDER BY s.timestamp DESC
  `

  // Get all active substages for this project
  const activeSubstagesQuery = `
    SELECT ss.*, 
      eo.employeeName AS ownerName, 
      cb.employeeName AS createdByName,
      st.stageName AS parentStageName
    FROM substage ss
    LEFT JOIN employee eo ON ss.owner = eo.employeeId
    LEFT JOIN employee cb ON ss.createdBy = cb.employeeId
    LEFT JOIN stage st ON ss.stageId = st.stageId AND st.historyOf IS NULL
    WHERE ss.projectNumber = ? AND ss.historyOf IS NULL
    ORDER BY ss.seqPrevStage ASC
  `

  // Get all substage history records for this project
  const substageHistoryQuery = `
    SELECT ss.*, 
      eo.employeeName AS ownerName, 
      cb.employeeName AS createdByName,
      st.stageName AS parentStageName
    FROM substage ss
    LEFT JOIN employee eo ON ss.owner = eo.employeeId
    LEFT JOIN employee cb ON ss.createdBy = cb.employeeId
    LEFT JOIN stage st ON ss.stageId = st.stageId AND st.historyOf IS NULL
    WHERE ss.projectNumber = ? AND ss.historyOf IS NOT NULL
    ORDER BY ss.timestamp DESC
  `

  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-CA') : null

  const formatRecord = (record) => ({
    ...record,
    startDate: formatDate(record.startDate),
    endDate: formatDate(record.endDate),
    executedStartDate: formatDate(record.executedStartDate),
    executedEndDate: formatDate(record.executedEndDate),
    timestamp: record.timestamp ? new Date(record.timestamp).toISOString() : null,
  })

  try {
    const [projectData, projectHistory, activeStages, stageHistory, activeSubstages, substageHistory] = await Promise.all([
      executeQuery(projectQuery, [projectNumber]),
      executeQuery(projectHistoryQuery, [projectNumber]),
      executeQuery(activeStagesQuery, [projectNumber]),
      executeQuery(stageHistoryQuery, [projectNumber]),
      executeQuery(activeSubstagesQuery, [projectNumber]),
      executeQuery(substageHistoryQuery, [projectNumber]),
    ])

    // Build tree: substages nested under their parent substage or stage
    const buildSubstageTree = (stageId) => {
      const stageSubstages = activeSubstages.filter(ss => ss.stageId === stageId)

      const buildChildren = (parentId) => {
        return stageSubstages
          .filter(ss => (ss.parentSubstageId || null) === parentId)
          .map(ss => ({
            ...formatRecord(ss),
            history: substageHistory
              .filter(h => h.historyOf === ss.substageId)
              .map(formatRecord),
            children: buildChildren(ss.substageId),
          }))
      }

      return buildChildren(null)
    }

    const tree = {
      project: {
        ...formatRecord(projectData[0] || {}),
        history: projectHistory.map(formatRecord),
      },
      stages: activeStages.map(stage => ({
        ...formatRecord(stage),
        history: stageHistory
          .filter(h => h.historyOf === stage.stageId)
          .map(formatRecord),
        substages: buildSubstageTree(stage.stageId),
      })),
    }

    res.status(200).json(new ApiResponse(200, tree, 'Project tree history retrieved.'))
  } catch (err) {
    console.error('Error fetching project tree history:', err)
    return res.status(500).send(new ApiError(500, 'Error fetching history'))
  }
})

// Get stuck (incomplete) stages and substages for given project numbers
export const getStuckStagesForProjects = asyncHandler(async (req, res) => {
  const { projectNumbers } = req.body

  if (!projectNumbers || !Array.isArray(projectNumbers) || projectNumbers.length === 0) {
    return res.status(400).json(new ApiError(400, 'projectNumbers array is required'))
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-CA') : null

  try {
    // Get incomplete stages
    const [stages] = await db.promise().query(
      `SELECT s.stageId, s.projectNumber, s.stageName, s.progress, s.startDate, s.endDate,
              eo.employeeName AS ownerName
       FROM stage s
       LEFT JOIN employee eo ON s.owner = eo.employeeId
       WHERE s.projectNumber IN (?) AND s.historyOf IS NULL AND s.progress < 100`,
      [projectNumbers]
    )

    // Get incomplete substages for those projects
    const [substages] = await db.promise().query(
      `SELECT ss.substageId, ss.stageId, ss.projectNumber, ss.substageName, ss.progress,
              ss.startDate, ss.endDate, eo.employeeName AS ownerName
       FROM substage ss
       LEFT JOIN employee eo ON ss.owner = eo.employeeId
       WHERE ss.projectNumber IN (?) AND ss.historyOf IS NULL AND ss.progress < 100`,
      [projectNumbers]
    )

    // Group by projectNumber
    const result = {}
    for (const pn of projectNumbers) {
      result[pn] = {
        stages: stages
          .filter(s => s.projectNumber === pn)
          .map(s => ({
            ...s,
            startDate: formatDate(s.startDate),
            endDate: formatDate(s.endDate),
          })),
        substages: substages
          .filter(ss => ss.projectNumber === pn)
          .map(ss => ({
            ...ss,
            startDate: formatDate(ss.startDate),
            endDate: formatDate(ss.endDate),
          })),
      }
    }

    res.status(200).json(new ApiResponse(200, result, 'Stuck stages retrieved successfully.'))
  } catch (err) {
    console.error('Error fetching stuck stages:', err)
    return res.status(500).json(new ApiError(500, 'Error fetching stuck stages'))
  }
})
