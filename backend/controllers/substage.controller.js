import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

export const getSubStagesByStageId = asyncHandler(async (req, res) => {
  console.log(req.params)

  const stageId = req.params.id
  
  // Extract rbac context from req.rbac
  const rbac = req.rbac || {}
  const currentUserId = req.user[0]?.employeeId
  
  console.log('[Substage Controller] Getting substages for stageId:', stageId, 'RBAC:', {
    isManager: rbac.isManager,
    ownedStages: rbac.ownedStages,
    ownedSubstages: rbac.ownedSubstages,
    role: rbac.role
  })
  
  // Base query - Include ownerEmployeeId for ownership checks
  let query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById, eo.employeeId AS ownerEmployeeId
FROM substage ss
INNER JOIN employee eo ON ss.owner = eo.employeeId
INNER JOIN employee cb ON ss.createdBy = cb.employeeId
WHERE ss.stageId = ?`
  
  let queryParams = [stageId]
  
  // Apply RBAC filtering: ONLY if user is not a Manager
  if (rbac.isManager === false) {
    // User is Assignee (not Manager) - check if they own the parent stage
    const ownsParentStage = rbac.ownedStages && rbac.ownedStages.includes(parseInt(stageId))
    
    console.log('[Substage Controller] User is Assignee - Owns parent stage:', ownsParentStage)
    
    if (!ownsParentStage) {
      // User doesn't own parent stage, so only show substages they own
      if (rbac.ownedSubstages && rbac.ownedSubstages.length > 0) {
        query += ` AND ss.substageId IN (?)`
        queryParams.push(rbac.ownedSubstages)
        console.log('[Substage Controller] Filtering by ownedSubstages:', rbac.ownedSubstages)
      } else {
        // User has no substage ownership and doesn't own parent stage - return empty
        query += ` AND 1 = 0`
        console.log('[Substage Controller] No substage ownership - returning empty')
      }
    } else {
      console.log('[Substage Controller] User owns parent stage - showing all substages')
    }
    // If user owns parent stage, no additional filtering needed - they see all substages
  } else if (rbac.isManager === true) {
    console.log('[Substage Controller] Manager - No filtering, returning all substages')
  }
  
  query += `;`

  db.query(query, queryParams, (err, data) => {
    if (err) {
      console.error('Error retrieving substages:', err)
      res.status(500).send(new ApiError(500, 'Error retrieving substages'))
      return
    }

    if (data.length === 0) {
      res.status(200).send(new ApiError(404, 'No substages found'))
      return
    }
    
    console.log('[Substage Controller] Substages found:', data.length)
    
    // Map substages with permission flags and date formatting
    const substages = data.map((substage) => {
      // Determine if user directly owns this substage
      const isDirectOwner = substage.ownerEmployeeId === currentUserId
      
      // canEdit: Manager can edit all, or if user owns substage directly, or if user owns parent stage
      const canEdit = rbac.isManager === true
        || (rbac.ownedSubstages && rbac.ownedSubstages.includes(substage.substageId))
        || (rbac.ownedStages && rbac.ownedStages.includes(parseInt(stageId)))
      
      // canMarkComplete: Only the direct owner can mark as complete
      const canMarkComplete = isDirectOwner
      
      return {
        ...substage,
        canEdit,
        canMarkComplete,
        // Add flag to indicate if user directly owns this substage (useful for UI differentiation)
        isOwnedByUser: rbac.ownedSubstages && rbac.ownedSubstages.includes(substage.substageId),
        isOwnedByCurrentUser: isDirectOwner, // Direct ownership by current logged-in user
        startDate: substage.startDate
          ? new Date(substage.startDate).toLocaleDateString('en-CA')
          : null,
        endDate: substage.endDate
          ? new Date(substage.endDate).toLocaleDateString('en-CA')
          : null,
        executedStartDate: substage.executedStartDate
          ? new Date(substage.executedStartDate).toLocaleDateString('en-CA')
          : null,
        executedEndDate: substage.executedEndDate
          ? new Date(substage.executedEndDate).toLocaleDateString('en-CA')
          : null,
      }
    })
    
    console.log('[Substage Controller] Returning', substages.length, 'substages with canEdit and canMarkComplete flags')
    
    res
      .status(200)
      .json(new ApiResponse(200, substages, 'Substages retrieved successfully.'))
  })
})

export const getHistorySubStagesBySubStageId = asyncHandler(
  async (req, res) => {
    const subStageId = req.params.id
    const query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
       FROM substage ss
       INNER JOIN employee eo ON ss.owner = eo.employeeId
       INNER JOIN employee cb ON ss.createdBy = cb.employeeId
       WHERE ss.historyOf = ?
       ORDER BY ss.timestamp DESC;`

    db.query(query, [subStageId], (err, data) => {
      if (err) {
        console.error('Error retrieving historical substages:', err)
        return res
          .status(500)
          .send(new ApiError(500, 'Error retrieving historical substages'))
      }

      if (data.length === 0) {
        return res
          .status(404)
          .send(new ApiError(404, 'No historical substages found'))
      }

      const substages = data.map((substage) => ({
        ...substage,
        startDate: substage.startDate
          ? new Date(substage.startDate).toLocaleDateString('en-CA')
          : null,
        endDate: substage.endDate
          ? new Date(substage.endDate).toLocaleDateString('en-CA')
          : null,
        executedStartDate: substage.executedStartDate
          ? new Date(substage.executedStartDate).toLocaleDateString('en-CA')
          : null,
        executedEndDate: substage.executedEndDate
          ? new Date(substage.executedEndDate).toLocaleDateString('en-CA')
          : null,
      }))
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            substages,
            'Historical substages retrieved successfully.'
          )
        )
    })
  }
)

export const getActiveSubStagesByStageId = asyncHandler(async (req, res) => {
  const stageId = req.params.id
  
  // Extract RBAC context
  const rbac = req.rbac || {}
  const currentUserId = req.user[0]?.employeeId
  
  console.log('[getActiveSubStages] Getting active substages for stageId:', stageId, 'RBAC:', {
    isManager: rbac.isManager,
    ownedStages: rbac.ownedStages,
    ownedSubstages: rbac.ownedSubstages,
    currentUserId
  })
  
  // Base query - Include ownerEmployeeId for ownership checks
  let query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById, eo.employeeId AS ownerEmployeeId
FROM substage ss
INNER JOIN employee eo ON ss.owner = eo.employeeId
INNER JOIN employee cb ON ss.createdBy = cb.employeeId
WHERE ss.stageId = ?
AND ss.historyOf IS NULL`
  
  let queryParams = [stageId]
  
  // Apply RBAC filtering: ONLY if user is not a Manager
  if (rbac.isManager === false) {
    // User is Assignee (not Manager) - check if they own the parent stage
    const ownsParentStage = rbac.ownedStages && rbac.ownedStages.includes(parseInt(stageId))
    
    console.log('[getActiveSubstages] User is Assignee - Owns parent stage:', ownsParentStage)
    
    if (!ownsParentStage) {
      // User doesn't own parent stage, so only show substages they own
      if (rbac.ownedSubstages && rbac.ownedSubstages.length > 0) {
        query += ` AND ss.substageId IN (?)`
        queryParams.push(rbac.ownedSubstages)
        console.log('[getActiveSubstages] Filtering by ownedSubstages:', rbac.ownedSubstages)
      } else {
        // User has no substage ownership and doesn't own parent stage - return empty
        query += ` AND 1 = 0`
        console.log('[getActiveSubstages] No substage ownership - returning empty')
      }
    } else {
      console.log('[getActiveSubstages] User owns parent stage - showing all substages')
    }
  } else if (rbac.isManager === true) {
    console.log('[getActiveSubstages] Manager - No filtering, returning all substages')
  }
  
  query += `;`
  
  console.log('[getActiveSubstages] Final Query:', query)
  console.log('[getActiveSubstages] Query Params:', queryParams)

  db.query(query, queryParams, (err, data) => {
    if (err) {
      console.error('Error retrieving active substages:', err)
      return res
        .status(500)
        .send(new ApiError(500, 'Error retrieving active substages'))
    }

    if (data.length === 0) {
      return res
        .status(404)
        .send(new ApiError(404, 'No active substages found'))
    }
    
    console.log('[getActiveSubstages] Substages found:', data.length)

    // Helper function to order substages by seqPrevStage
    const orderSubstagesBySeqPrevStage = (substages) => {
      const substageMap = new Map()
      const orderedSubstages = []

      // Add substages to the map for quick lookup
      substages.forEach((substage) => {
        substageMap.set(substage.substageId, substage)
      })

      // Find the first substage (the one with no previous substage)
      let firstSubstage = substages.find(
        (substage) => !substageMap.has(substage.seqPrevStage)
      )

      if (!firstSubstage) {
        return []
      }

      // Start ordering the substages
      orderedSubstages.push(firstSubstage)

      let currentSubstage = firstSubstage

      // Traverse and find the next substages based on seqPrevStage
      while (currentSubstage) {
        const nextSubstage = substages.find(
          (substage) => substage.seqPrevStage === currentSubstage.substageId
        )

        if (nextSubstage) {
          orderedSubstages.push(nextSubstage)
        }

        currentSubstage = nextSubstage
      }

      return orderedSubstages
    }

    // Format dates and add RBAC permission flags
    const substages = data.map((substage) => {
      // Determine if user directly owns this substage
      const isDirectOwner = substage.ownerEmployeeId === currentUserId
      
      // canEdit: Manager can edit all, or if user owns substage directly, or if user owns parent stage
      const canEdit = rbac.isManager === true
        || (rbac.ownedSubstages && rbac.ownedSubstages.includes(substage.substageId))
        || (rbac.ownedStages && rbac.ownedStages.includes(parseInt(stageId)))
      
      // canMarkComplete: Only the direct owner can mark as complete
      const canMarkComplete = isDirectOwner
      
      console.log('[getActiveSubstages] Substage', substage.substageId, ':', {
        substageName: substage.substageName,
        owner: substage.owner,
        ownerEmployeeId: substage.ownerEmployeeId,
        currentUserId,
        isDirectOwner,
        canEdit,
        canMarkComplete,
        rbacIsManager: rbac.isManager
      })
      
      return {
        ...substage,
        canEdit,
        canMarkComplete,
        isOwnedByCurrentUser: isDirectOwner,
        startDate: substage.startDate
          ? new Date(substage.startDate).toLocaleDateString('en-CA')
          : null,
        endDate: substage.endDate
          ? new Date(substage.endDate).toLocaleDateString('en-CA')
          : null,
        executedStartDate: substage.executedStartDate
          ? new Date(substage.executedStartDate).toLocaleDateString('en-CA')
          : null,
        executedEndDate: substage.executedEndDate
          ? new Date(substage.executedEndDate).toLocaleDateString('en-CA')
          : null,
      }
    })

    // const orderedSubstages = orderSubstagesBySeqPrevStage(substages)
    
    console.log('[getActiveSubstages] Returning', substages.length, 'substages with canEdit and canMarkComplete flags')

    // Return the ordered substages
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          substages,
          'Active substages retrieved successfully.'
        )
      )
  })
})

//get substages by project number
export const getSubStagesByProjectNumber = asyncHandler(async (req, res) => {
  // console.log(req.params)

  const projectNumber = req.params.projectNumber
  const query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
FROM substage ss
INNER JOIN employee eo ON ss.owner = eo.employeeId
INNER JOIN employee cb ON ss.createdBy = cb.employeeId
WHERE ss.projectNumber = ?;`

  db.query(query, [projectNumber], (err, data) => {
    if (err) {
      res.status(200).send(new ApiError(500, 'Error retrieving stage'))
      return
    }

    if (data.length === 0) {
      res.status(200).send(new ApiError(404, 'Stage not found'))
      return
    }

    const substages = data.map((substage) => ({
      ...substage,
      startDate: substage.startDate
        ? new Date(substage.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: substage.endDate
        ? new Date(substage.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: substage.executedStartDate
        ? new Date(substage.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: substage.executedEndDate
        ? new Date(substage.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(new ApiResponse(200, substages, 'Stage retrieved successfully.'))
  })
})

// Update substage and store history
export const updateSubStage = asyncHandler(async (req, res) => {
  console.log(req.body);
  const substageId = req.params.id; // Get the current substage ID from the request parameters
  const { rbac } = req;

  // RBAC Authorization Check
  if (rbac.isManager !== true) {
    // Check if user directly owns this substage
    const directlyOwned = rbac.ownedSubstages.includes(parseInt(substageId));
    
    if (!directlyOwned) {
      // Query to get parent stageId for additional check
      const [substageCheck] = await db.promise().query(
        'SELECT stageId FROM substage WHERE substageId = ?',
        [substageId]
      );

      // Check if substage exists
      if (!substageCheck || substageCheck.length === 0) {
        return res.status(404).json({
          message: 'Substage not found'
        });
      }

      // Check if user owns the parent stage
      const ownsParentStage = rbac.ownedStages.includes(substageCheck[0].stageId);
      
      if (!ownsParentStage) {
        return res.status(403).json({
          message: 'You do not have permission to edit this substage'
        });
      }
    }
  }

  // SQL queries
  const selectQuery = `SELECT * FROM substage WHERE substageId = ?`;
  const insertQuery = `
    INSERT INTO substage (
      stageId, parentSubstageId, substageName, startDate, endDate, owner, machine, duration,
      seqPrevStage, createdBy, progress, historyOf, updateReason, projectNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const updateQuery = `
    UPDATE substage SET
      stageId = ?, parentSubstageId = ?, substageName = ?, startDate = ?, endDate = ?,
      owner = ?, machine = ?, duration = ?, seqPrevStage = ?,
      createdBy = ?, timestamp = ?, progress = ?, historyOf = NULL
    WHERE substageId = ?
  `;

  // Retrieve the current substage data
  db.query(selectQuery, [substageId], (err, substageData) => {
    if (err) {
      console.error("Error retrieving substage:", err);
      return res
        .status(500)
        .send(new ApiError(500, "Error retrieving substage"));
    }

    if (substageData.length === 0) {
      return res.status(404).send(new ApiError(404, "Substage not found"));
    }

    const substage = substageData[0];

    // Extract customEmployeeId from the owner field
    const match = req.body.owner ? req.body.owner.match(/\(([^)]+)\)/) : null;
    const customEmployeeId = match ? match[1] : null;

    if (!customEmployeeId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "customEmployeeId is required"));
    }

    // Query to find the corresponding employeeId
    const checkOwnerQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`;
    db.query(checkOwnerQuery, [customEmployeeId], (err, result) => {
      if (err) {
        console.log("Error checking owner:", err);
        return res
          .status(500)
          .json(new ApiResponse(500, null, "Error checking owner"));
      }
      if (result.length === 0) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Owner not found in employee table"));
      }

      const employeeId = result[0].employeeId; // Get the employeeId
      const owner = employeeId; // Set the owner as employeeId

      // Create history for the substage
      const insertValues = [
        substage.stageId,  // Fixed: use stageId not substageId
        substage.parentSubstageId || null,
        substage.substageName,
        substage.startDate,
        substage.endDate,
        substage.owner,
        substage.machine,
        substage.duration,
        substage.seqPrevStage,
        substage.createdBy,
        substage.progress,
        substageId, // Correctly set historyOf to the current substageId
        req.body.updateReason || "", // Store reason for the update; fallback to an empty string
        substage.projectNumber, // Correctly set projectNumber from the existing substage record
      ];

      // Prepare updated fields
      const updatedFields = {
        stageId: req.body.stageId || substage.stageId,  // Fixed: use stageId
        parentSubstageId: req.body.parentSubstageId !== undefined ? req.body.parentSubstageId : substage.parentSubstageId,
        substageName: req.body.substageName || substage.substageName,
        startDate: req.body.startDate || substage.startDate,
        endDate: req.body.endDate || substage.endDate,
        owner: owner, // Use updated owner (employeeId)
        machine: req.body.machine || substage.machine,
        duration: req.body.duration || substage.duration,
        seqPrevStage: req.body.seqPrevStage || substage.seqPrevStage,
        createdBy: req.user[0].employeeId || substage.createdBy,
        timestamp: req.body.timestamp,
        progress: req.body.progress || substage.progress,
      };

      // Check if any field has changed
      const isChanged = Object.keys(updatedFields).some(
        (key) => updatedFields[key] !== substage[key]
      );

      if (!isChanged) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, null, "No changes detected, substage not updated.")
          );
      }

      // Create history and then update the substage if changes are detected
      db.query(insertQuery, insertValues, (err) => {
        if (err) {
          console.error("Error creating new substage in history:", err);
          return res
            .status(500)
            .send(new ApiError(500, "Error creating new substage in history"));
        }

        const timestamp = new Date(req.body.timestamp)
          .toISOString()
          .replace("T", " ")
          .replace("Z", "");
        const updateValues = [
          updatedFields.stageId || substage.stageId,  // Fixed: use stageId
          updatedFields.parentSubstageId || null,
          updatedFields.substageName,
          updatedFields.startDate,
          updatedFields.endDate,
          updatedFields.owner,
          updatedFields.machine,
          updatedFields.duration,
          updatedFields.seqPrevStage,
          updatedFields.createdBy,
          timestamp,
          updatedFields.progress,
          substageId, // Update the existing substage by its current ID
        ];

        db.query(updateQuery, updateValues, (err, updateData) => {
          if (err) {
            console.error("Error updating substage:", err);
            return res
              .status(500)
              .send(new ApiError(500, "Error updating substage"));
          }

          res
            .status(200)
            .json(
              new ApiResponse(
                200,
                updateData,
                "Substage updated successfully."
              )
            );
        });
      });
    });
  });
});


export const createSubStage = asyncHandler(async (req, res) => {
  // Extract customEmployeeId from owner field
  const match = req.body.owner ? req.body.owner.match(/\(([^)]+)\)/) : null
  const customEmployeeId = match ? match[1] : null

  console.log('Creating substage with data:', req.body)

  if (!customEmployeeId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'customEmployeeId is required'))
  }

  // Query to find the corresponding employeeId
  const checkOwnerQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
  db.query(checkOwnerQuery, [customEmployeeId], (err, result) => {
    if (err) {
      console.log('Error checking owner:', err)
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Error checking owner'))
    }
    if (result.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Owner not found in employee table'))
    }

    const employeeId = result[0].employeeId
    const parentSubstageId = req.body.parentSubstageId || null

    // Recursively update all ancestor parents' completion status
    const updateAncestorsCompletion = (currentParentId, callback) => {
      if (!currentParentId) {
        callback()
        return
      }

      // Update current parent to incomplete if it was completed
      const updateParentQuery = `
        UPDATE substage 
        SET isCompleted = 0, 
            progress = 0,
            executedStartDate = NULL,
            executedEndDate = NULL
        WHERE substageId = ? AND isCompleted = 1
      `
      
      db.query(updateParentQuery, [currentParentId], (err, updateResult) => {
        if (err) {
          console.log('Error updating ancestor completion status:', err)
          callback()
          return
        }
        
        if (updateResult.affectedRows > 0) {
          console.log(`Ancestor substage ${currentParentId} marked as incomplete due to new descendant`)
        }

        // Find the parent of current parent (grandparent) and recursively update
        const findGrandparentQuery = `SELECT parentSubstageId FROM substage WHERE substageId = ?`
        db.query(findGrandparentQuery, [currentParentId], (err, grandparentResult) => {
          if (err || grandparentResult.length === 0) {
            callback()
            return
          }

          const grandparentId = grandparentResult[0].parentSubstageId
          if (grandparentId) {
            // Recursively update grandparent
            updateAncestorsCompletion(grandparentId, callback)
          } else {
            callback()
          }
        })
      })
    }

    updateAncestorsCompletion(parentSubstageId, () => {
      const stageQuery = `INSERT INTO substage (
        stageId, parentSubstageId, substageName, startDate, endDate, owner, machine, duration,
        seqPrevStage, createdBy, progress, ProjectNumber
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

      const values = [
        // req.body.substageId,
        req.body.stageId,
        parentSubstageId,
        req.body.substagename,
        req.body.startDate,
        req.body.endDate,
        employeeId, // Use employeeId for owner
        req.body.machine,
        req.body.duration,
        req.body.seqPrevStage,
        req.user[0].employeeId,
        req.body.progress,
        req.body.projectNumber,
      ]

      console.log('Creating substage with values:', values)

      db.query(stageQuery, values, (err, data) => {
        if (err) {
          console.log(err)
          return res
            .status(500)
            .json(new ApiResponse(500, null, 'Error creating substage'))
        }

        // Get the newly created substageId
        const newSubstageId = data.insertId
        
        // If owner is different from creator, create a stage_assignment record
        if (employeeId !== req.user[0].employeeId) {
          const assignmentQuery = `INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy)
            VALUES (?, NULL, ?, ?, ?)`
          
          db.query(
            assignmentQuery,
            [req.body.projectNumber, newSubstageId, employeeId, req.user[0].employeeId],
            (assignmentErr) => {
              if (assignmentErr) {
                console.error('Error creating substage assignment:', assignmentErr)
                // Don't fail the substage creation, just log the error
              } else {
                console.log(`[Substage Creation] Created assignment: substage ${newSubstageId} assigned to employee ${employeeId}`)
              }
            }
          )
        }

        // After creating substage, recalculate stage progress
        const stageId = req.body.stageId
        const projectNumber = req.body.projectNumber

        // Recalculate stage progress based on substage completion
        db.query(
          'SELECT COUNT(*) as total, SUM(isCompleted) as completed FROM substage WHERE stageId = ? AND historyOf IS NULL',
          [stageId],
          (err, stats) => {
            if (!err && stats.length > 0) {
              const total = stats[0].total || 1
              const completed = stats[0].completed || 0
              const stageProgress = Math.round((completed / total) * 100)

              // Update stage progress
              db.query(
                'UPDATE stage SET progress = ? WHERE stageId = ?',
                [stageProgress, stageId],
                (err) => {
                  if (err) {
                    console.log('Error updating stage progress:', err)
                  } else {
                    console.log(`Stage ${stageId} progress updated to ${stageProgress}%`)
                  }

                  // Recalculate project progress
                  if (projectNumber) {
                    db.query(
                      'SELECT AVG(progress) as avgProgress FROM stage WHERE projectNumber = ? AND historyOf IS NULL',
                      [projectNumber],
                      (err, projStats) => {
                        if (!err && projStats.length > 0) {
                          const projectProgress = Math.round(projStats[0].avgProgress || 0)
                          db.query(
                            'UPDATE project SET progress = ? WHERE projectNumber = ?',
                            [projectProgress, projectNumber],
                            (err) => {
                              if (err) {
                                console.log('Error updating project progress:', err)
                              } else {
                                console.log(`Project ${projectNumber} progress updated to ${projectProgress}%`)
                              }
                            }
                          )
                        }
                      }
                    )
                  }
                }
              )
            }

            // Return success response
            res
              .status(201)
              .json(new ApiResponse(201, data, 'Substage created successfully'))
          }
        )
      })
    })
  })
})

// Helper: recursively collect all descendant substage IDs
const collectDescendantIds = async (substageId) => {
  const [children] = await db
    .promise()
    .query('SELECT substageId FROM substage WHERE parentSubstageId = ?', [substageId])
  let ids = []
  for (const child of children) {
    ids.push(child.substageId)
    const descendantIds = await collectDescendantIds(child.substageId)
    ids = ids.concat(descendantIds)
  }
  return ids
}

export const deleteSubStage = asyncHandler(async (req, res) => {
  const substageId = req.params.id

  try {
    // Find the previous substage of the substage to be deleted
    const findPrevSubStageQuery =
      'SELECT seqPrevStage FROM substage WHERE substageId = ?'
    const [prevSubStageData] = await db
      .promise()
      .query(findPrevSubStageQuery, [substageId])

    if (prevSubStageData.length === 0) {
      console.error(`Substage with ID ${substageId} not found`)
      return res.status(404).send(new ApiError(404, 'Substage not found'))
    }

    const prevSubStageId = prevSubStageData[0].seqPrevStage

    // Update subsequent substages to point to the previous substage
    const updateSubsequentSubStagesQuery =
      'UPDATE substage SET seqPrevStage = ? WHERE seqPrevStage = ?'
    await db
      .promise()
      .query(updateSubsequentSubStagesQuery, [prevSubStageId, substageId])

    // Collect all descendant substage IDs (recursive children)
    const descendantIds = await collectDescendantIds(substageId)
    const allIdsToDelete = [substageId, ...descendantIds]

    // Delete the substage and all its descendants
    const deleteSubStageQuery = `DELETE FROM substage WHERE substageId IN (?)`
    const [deleteResult] = await db
      .promise()
      .query(deleteSubStageQuery, [allIdsToDelete])

    if (deleteResult.affectedRows === 0) {
      console.error(`Failed to delete substage with ID ${substageId}`)
      return res.status(404).send(new ApiError(404, 'Substage not found'))
    }

    // Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          substageId,
          'Substage and all child substages deleted successfully.'
        )
      )
  } catch (err) {
    console.error(err)
    res.status(500).send(new ApiError(500, 'Error deleting substage'))
  }
})

export const getSingleSubStageById = asyncHandler(async (req, res) => {
  const subStageId = req.params.id
  console.log('Fetching substage with ID:', subStageId)
  const query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy,
                        eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
                 FROM substage ss
                 INNER JOIN employee eo ON ss.owner = eo.employeeId
                 INNER JOIN employee cb ON ss.createdBy = cb.employeeId
                 WHERE ss.subStageId = ? AND ss.historyOf IS NULL`

  db.query(query, [subStageId], (err, data) => {
    if (err) {
      res.status(500).send(new ApiError(500, 'Error retrieving substage'))
      return
    }
    if (data.length === 0) {
      res.status(404).send(new ApiError(404, 'No substage found'))
      return
    }

    const substage = {
      ...data[0],
      startDate: data[0].startDate
        ? new Date(data[0].startDate).toLocaleDateString('en-CA')
        : null,
      endDate: data[0].endDate
        ? new Date(data[0].endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: data[0].executedStartDate
        ? new Date(data[0].executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: data[0].executedEndDate
        ? new Date(data[0].executedEndDate).toLocaleDateString('en-CA')
        : null,
    }

    console.log('Retrieved substage:', substage)

    res
      .status(200)
      .json(new ApiResponse(200, substage, 'SubStage retrieved successfully.'))
  })
})

// Get direct children of a substage (by parentSubstageId)
export const getSubStageChildren = asyncHandler(async (req, res) => {
  const parentSubstageId = req.params.id
  const query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy,
                        eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
                 FROM substage ss
                 INNER JOIN employee eo ON ss.owner = eo.employeeId
                 INNER JOIN employee cb ON ss.createdBy = cb.employeeId
                 WHERE ss.parentSubstageId = ? AND ss.historyOf IS NULL`

  db.query(query, [parentSubstageId], (err, data) => {
    if (err) {
      console.error('Error retrieving child substages:', err)
      return res
        .status(500)
        .send(new ApiError(500, 'Error retrieving child substages'))
    }

    const substages = data.map((substage) => ({
      ...substage,
      startDate: substage.startDate
        ? new Date(substage.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: substage.endDate
        ? new Date(substage.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: substage.executedStartDate
        ? new Date(substage.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: substage.executedEndDate
        ? new Date(substage.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))

    res
      .status(200)
      .json(
        new ApiResponse(200, substages, 'Child substages retrieved successfully.')
      )
  })
})

// Toggle isCompleted for a substage + recalculate stage AND project progress
// Also saves executedStartDate & executedEndDate when completing, clears when unchecking
export const toggleSubStageCompletion = asyncHandler(async (req, res) => {
  const substageId = req.params.id
  const { isCompleted, executedStartDate, executedEndDate } = req.body
  const currentUserId = req.user[0]?.employeeId

  // Permission check: User must be the direct owner to mark as complete
  // First, get the substage owner
  const [substageData] = await db.promise().query(
    'SELECT owner, stageId, projectNumber FROM substage WHERE substageId = ?',
    [substageId]
  )
  
  if (!substageData || substageData.length === 0) {
    return res.status(404).send(new ApiError(404, 'Substage not found'))
  }
  
  const substageOwner = substageData[0].owner // This is employeeId
  
  // Only the direct owner can mark task as complete (not even Manager can do this)
  if (substageOwner !== currentUserId) {
    console.log('[Substage Controller] Permission denied: User', currentUserId, 'cannot mark substage', substageId, 'as complete. Owner is:', substageOwner)
    return res.status(403).json(
      new ApiError(403, 'Only the assigned employee can mark this task as completed')
    )
  }
  
  console.log('[Substage Controller] User', currentUserId, 'is owner of substage', substageId, '- allowing completion toggle')

  const newProgress = isCompleted ? 100 : 0
  const execStart = isCompleted && executedStartDate ? executedStartDate : null
  const execEnd = isCompleted && executedEndDate ? executedEndDate : null

  // 1. Update substage completion, progress & executed dates
  const updateQuery = `UPDATE substage SET isCompleted = ?, progress = ?, executedStartDate = ?, executedEndDate = ? WHERE substageId = ?`
  db.query(updateQuery, [isCompleted ? 1 : 0, newProgress, execStart, execEnd, substageId], (err, result) => {
    if (err) {
      console.error('Error toggling completion:', err)
      return res
        .status(500)
        .send(new ApiError(500, 'Error updating completion status'))
    }
    if (result.affectedRows === 0) {
      return res.status(404).send(new ApiError(404, 'Substage not found'))
    }

    // 2. Get the stageId and projectNumber
    const stageId = substageData[0].stageId
    const projectNumber = substageData[0].projectNumber

      // 3. Recalculate stage progress = % of substages completed
      db.query(
        'SELECT COUNT(*) as total, SUM(isCompleted) as completed FROM substage WHERE stageId = ? AND historyOf IS NULL',
        [stageId],
        (err, stats) => {
          if (err || stats.length === 0) {
            return res.status(200).json(new ApiResponse(200, { substageId, isCompleted }, 'Completion updated.'))
          }

          const total = stats[0].total || 1
          const completed = stats[0].completed || 0
          const stageProgress = Math.round((completed / total) * 100)

          // 4. Auto-compute stage executed dates from substages:
          //    executedStartDate = MIN of substages' executedStartDate
          //    executedEndDate = MAX of substages' executedEndDate (only if ALL substages completed)
          const stageExecDateQuery = `
            SELECT
              MIN(executedStartDate) as stageExecStart,
              MAX(executedEndDate) as stageExecEnd,
              COUNT(*) as totalSubs,
              SUM(isCompleted) as completedSubs
            FROM substage
            WHERE stageId = ? AND historyOf IS NULL
          `
          db.query(stageExecDateQuery, [stageId], (err, execStats) => {
            const stageExecStart = execStats && execStats[0] && execStats[0].stageExecStart ? execStats[0].stageExecStart : null
            const allSubsDone = execStats && execStats[0] && Number(execStats[0].totalSubs) === Number(execStats[0].completedSubs)
            const stageExecEnd = allSubsDone && execStats[0].stageExecEnd ? execStats[0].stageExecEnd : null

            // 5. Update stage progress + executed dates
            db.query(
              'UPDATE stage SET progress = ?, executedStartDate = ?, executedEndDate = ? WHERE stageId = ?',
              [stageProgress, stageExecStart, stageExecEnd, stageId],
              () => {
                // 6. Recalculate project progress = avg of all stage progresses
                if (projectNumber) {
                  db.query(
                    'SELECT AVG(progress) as avgProgress FROM stage WHERE projectNumber = ? AND historyOf IS NULL',
                    [projectNumber],
                    (err, projStats) => {
                      if (!err && projStats.length > 0) {
                        const projectProgress = Math.round(projStats[0].avgProgress || 0)

                        // 7. Auto-compute project executed dates from stages
                        const projExecDateQuery = `
                          SELECT
                            MIN(executedStartDate) as projExecStart,
                            MAX(executedEndDate) as projExecEnd,
                            COUNT(*) as totalStages,
                            SUM(CASE WHEN progress = 100 THEN 1 ELSE 0 END) as completedStages
                          FROM stage
                          WHERE projectNumber = ? AND historyOf IS NULL
                        `
                        db.query(projExecDateQuery, [projectNumber], (err, projExecStats) => {
                          const projExecStart = projExecStats && projExecStats[0] && projExecStats[0].projExecStart ? projExecStats[0].projExecStart : null
                          const allStagesDone = projExecStats && projExecStats[0] && Number(projExecStats[0].totalStages) === Number(projExecStats[0].completedStages)
                          const projExecEnd = allStagesDone && projExecStats[0].projExecEnd ? projExecStats[0].projExecEnd : null

                          // 8. Auto-set projectStatus based on progress and endDate
                          db.query('SELECT endDate, projectStatus FROM project WHERE projectNumber = ?', [projectNumber], (err, projRows) => {
                            let newStatus = null
                            if (!err && projRows.length > 0) {
                              const currentStatus = projRows[0].projectStatus
                              const endDate = projRows[0].endDate ? new Date(projRows[0].endDate) : null
                              if (endDate) endDate.setHours(0, 0, 0, 0)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)

                              if (projectProgress >= 100) {
                                newStatus = 'Completed'
                              } else if (endDate && today > endDate) {
                                newStatus = 'Overdue'
                              } else if (currentStatus === 'Completed' && projectProgress < 100) {
                                newStatus = 'Ongoing'
                              } else if (currentStatus === 'Overdue' && endDate && today <= endDate) {
                                newStatus = 'Ongoing'
                              }
                            }

                            // Build dynamic UPDATE for project: progress + executed dates + optional status
                            let projectUpdateSql = 'UPDATE project SET progress = ?, executedStartDate = ?, executedEndDate = ?'
                            let projectUpdateParams = [projectProgress, projExecStart, projExecEnd]

                            if (newStatus) {
                              projectUpdateSql += ', projectStatus = ?'
                              projectUpdateParams.push(newStatus)
                            }
                            projectUpdateSql += ' WHERE projectNumber = ?'
                            projectUpdateParams.push(projectNumber)

                            db.query(projectUpdateSql, projectUpdateParams, () => {
                              res.status(200).json(
                                new ApiResponse(200, {
                                  substageId, isCompleted, stageProgress, projectProgress,
                                  projectStatus: newStatus,
                                  stageExecutedStartDate: stageExecStart,
                                  stageExecutedEndDate: stageExecEnd,
                                  projectExecutedStartDate: projExecStart,
                                  projectExecutedEndDate: projExecEnd,
                                }, 'Progress updated.')
                              )
                            })
                          })
                        })
                      } else {
                        res.status(200).json(
                          new ApiResponse(200, { substageId, isCompleted, stageProgress }, 'Progress updated.')
                        )
                      }
                    }
                  )
                } else {
                  res.status(200).json(
                    new ApiResponse(200, { substageId, isCompleted, stageProgress }, 'Progress updated.')
                  )
                }
              }
            )
          })
        }
      )
  })
})

// Update substage progress manually (0-100) + recalculate stage & project progress
export const updateSubStageProgress = asyncHandler(async (req, res) => {
  const substageId = req.params.id
  const { progress, executedStartDate, executedEndDate } = req.body
  const currentUserId = req.user[0]?.employeeId

  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json(new ApiResponse(400, null, 'Progress must be between 0 and 100'))
  }

  const newProgress = Math.round(progress)
  const isCompleted = newProgress >= 100 ? 1 : 0
  
  // Permission check: Only the direct owner can set progress to 100% (mark as complete)
  if (isCompleted) {
    const [substageData] = await db.promise().query(
      'SELECT owner FROM substage WHERE substageId = ?',
      [substageId]
    )
    
    if (!substageData || substageData.length === 0) {
      return res.status(404).send(new ApiError(404, 'Substage not found'))
    }
    
    const substageOwner = substageData[0].owner
    
    if (substageOwner !== currentUserId) {
      console.log('[Substage Controller] Permission denied: User', currentUserId, 'cannot set substage', substageId, 'to 100%. Owner is:', substageOwner)
      return res.status(403).json(
        new ApiError(403, 'Only the assigned employee can mark this task as completed (100%)')
      )
    }
  }
  
  const execStart = isCompleted && executedStartDate ? executedStartDate : null
  const execEnd = isCompleted && executedEndDate ? executedEndDate : null

  // 1. Update substage progress, isCompleted, and executed dates
  const updateQuery = `UPDATE substage SET progress = ?, isCompleted = ?, executedStartDate = ?, executedEndDate = ? WHERE substageId = ?`
  db.query(updateQuery, [newProgress, isCompleted, execStart, execEnd, substageId], (err, result) => {
    if (err) {
      console.error('Error updating substage progress:', err)
      return res.status(500).send(new ApiError(500, 'Error updating substage progress'))
    }
    if (result.affectedRows === 0) {
      return res.status(404).send(new ApiError(404, 'Substage not found'))
    }

    // 2. Get the stageId and projectNumber
    db.query('SELECT stageId, projectNumber FROM substage WHERE substageId = ?', [substageId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(200).json(new ApiResponse(200, { substageId, progress: newProgress }, 'Progress updated.'))
      }

      const stageId = rows[0].stageId
      const projectNumber = rows[0].projectNumber

      // 3. Recalculate stage progress = avg of substage progresses
      db.query(
        'SELECT AVG(progress) as avgProgress FROM substage WHERE stageId = ? AND historyOf IS NULL',
        [stageId],
        (err, stats) => {
          if (err || stats.length === 0) {
            return res.status(200).json(new ApiResponse(200, { substageId, progress: newProgress }, 'Progress updated.'))
          }

          const stageProgress = Math.round(stats[0].avgProgress || 0)

          // 4. Auto-compute stage executed dates
          const stageExecDateQuery = `
            SELECT
              MIN(executedStartDate) as stageExecStart,
              MAX(executedEndDate) as stageExecEnd,
              COUNT(*) as totalSubs,
              SUM(isCompleted) as completedSubs
            FROM substage
            WHERE stageId = ? AND historyOf IS NULL
          `
          db.query(stageExecDateQuery, [stageId], (err, execStats) => {
            const stageExecStart = execStats && execStats[0] && execStats[0].stageExecStart ? execStats[0].stageExecStart : null
            const allSubsDone = execStats && execStats[0] && Number(execStats[0].totalSubs) === Number(execStats[0].completedSubs)
            const stageExecEnd = allSubsDone && execStats[0].stageExecEnd ? execStats[0].stageExecEnd : null

            // 5. Update stage progress + executed dates
            db.query(
              'UPDATE stage SET progress = ?, executedStartDate = ?, executedEndDate = ? WHERE stageId = ?',
              [stageProgress, stageExecStart, stageExecEnd, stageId],
              () => {
                // 6. Recalculate project progress
                if (projectNumber) {
                  db.query(
                    'SELECT AVG(progress) as avgProgress FROM stage WHERE projectNumber = ? AND historyOf IS NULL',
                    [projectNumber],
                    (err, projStats) => {
                      if (!err && projStats.length > 0) {
                        const projectProgress = Math.round(projStats[0].avgProgress || 0)

                        // 7. Auto-compute project executed dates
                        const projExecDateQuery = `
                          SELECT
                            MIN(executedStartDate) as projExecStart,
                            MAX(executedEndDate) as projExecEnd,
                            COUNT(*) as totalStages,
                            SUM(CASE WHEN progress = 100 THEN 1 ELSE 0 END) as completedStages
                          FROM stage
                          WHERE projectNumber = ? AND historyOf IS NULL
                        `
                        db.query(projExecDateQuery, [projectNumber], (err, projExecStats) => {
                          const projExecStart = projExecStats && projExecStats[0] && projExecStats[0].projExecStart ? projExecStats[0].projExecStart : null
                          const allStagesDone = projExecStats && projExecStats[0] && Number(projExecStats[0].totalStages) === Number(projExecStats[0].completedStages)
                          const projExecEnd = allStagesDone && projExecStats[0].projExecEnd ? projExecStats[0].projExecEnd : null

                          // 8. Auto-set projectStatus
                          db.query('SELECT endDate, projectStatus FROM project WHERE projectNumber = ?', [projectNumber], (err, projRows) => {
                            let newStatus = null
                            if (!err && projRows.length > 0) {
                              const currentStatus = projRows[0].projectStatus
                              const endDate = projRows[0].endDate ? new Date(projRows[0].endDate) : null
                              if (endDate) endDate.setHours(0, 0, 0, 0)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)

                              if (projectProgress >= 100) {
                                newStatus = 'Completed'
                              } else if (endDate && today > endDate) {
                                newStatus = 'Overdue'
                              } else if (currentStatus === 'Completed' && projectProgress < 100) {
                                newStatus = 'Ongoing'
                              } else if (currentStatus === 'Overdue' && endDate && today <= endDate) {
                                newStatus = 'Ongoing'
                              }
                            }

                            let projectUpdateSql = 'UPDATE project SET progress = ?, executedStartDate = ?, executedEndDate = ?'
                            let projectUpdateParams = [projectProgress, projExecStart, projExecEnd]

                            if (newStatus) {
                              projectUpdateSql += ', projectStatus = ?'
                              projectUpdateParams.push(newStatus)
                            }
                            projectUpdateSql += ' WHERE projectNumber = ?'
                            projectUpdateParams.push(projectNumber)

                            db.query(projectUpdateSql, projectUpdateParams, () => {
                              res.status(200).json(
                                new ApiResponse(200, {
                                  substageId, progress: newProgress, stageProgress, projectProgress,
                                  projectStatus: newStatus,
                                }, 'Substage progress updated successfully.')
                              )
                            })
                          })
                        })
                      } else {
                        res.status(200).json(
                          new ApiResponse(200, { substageId, progress: newProgress, stageProgress }, 'Progress updated.')
                        )
                      }
                    }
                  )
                } else {
                  res.status(200).json(
                    new ApiResponse(200, { substageId, progress: newProgress, stageProgress }, 'Progress updated.')
                  )
                }
              }
            )
          })
        }
      )
    })
  })
})
