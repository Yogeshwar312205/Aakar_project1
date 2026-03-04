import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

export const getSubStagesByStageId = asyncHandler(async (req, res) => {
  console.log(req.params)

  const stageId = req.params.id
  const query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
FROM substage ss
INNER JOIN employee eo ON ss.owner = eo.employeeId
INNER JOIN employee cb ON ss.createdBy = cb.employeeId
WHERE ss.stageId = ?;`

  db.query(query, [stageId], (err, data) => {
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
  const query = `SELECT ss.*, ss.parentSubstageId, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
FROM substage ss
INNER JOIN employee eo ON ss.owner = eo.employeeId
INNER JOIN employee cb ON ss.createdBy = cb.employeeId
WHERE ss.stageId = ? 
AND ss.historyOf IS NULL;`

  db.query(query, [stageId], (err, data) => {
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

    // Format dates and order the substages
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

    // const orderedSubstages = orderSubstagesBySeqPrevStage(substages)

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
        substage.substageId,
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
        substageId: req.body.substageId || substage.substageId,
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
          updatedFields.substageId,
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

    const stageQuery = `INSERT INTO substage (
      stageId, parentSubstageId, substageName, startDate, endDate, owner, machine, duration, 
      seqPrevStage, createdBy, progress, ProjectNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const values = [
      // req.body.substageId,
      req.body.stageId,
      req.body.parentSubstageId || null,
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
      res
        .status(201)
        .json(new ApiResponse(201, data, 'Substage created successfully'))
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
    db.query('SELECT stageId, projectNumber FROM substage WHERE substageId = ?', [substageId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(200).json(new ApiResponse(200, { substageId, isCompleted }, 'Completion updated.'))
      }

      const stageId = rows[0].stageId
      const projectNumber = rows[0].projectNumber

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
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)

                              if (projectProgress >= 100) {
                                newStatus = 'Completed'
                              } else if (endDate && today > endDate) {
                                newStatus = 'Overdue'
                              } else if (currentStatus === 'Completed' && projectProgress < 100) {
                                newStatus = 'In Progress'
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
})



