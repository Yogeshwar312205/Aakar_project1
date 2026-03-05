import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

//get Stages List
export const getStageList = asyncHandler(async (req, res) => {
  const query = 'SELECT DISTINCT stageName FROM stage'

  db.query(query, (err, data) => {
    if (err) {
      res.status(400).send(new ApiError(500, 'Error retrieving stages'))
    }
    const stageList = data.map((item) => item.stageName)

    res
      .status(200)
      .json(new ApiResponse(200, stageList, 'Stages retrieved successfully.'))
  })
})

// Get all stages
export const getAllStages = asyncHandler(async (req, res) => {
  const query =
    'SELECT s.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.employeeName AS owner,cb.customEmployeeId AS createdById  FROM stage s INNER JOIN employee eo ON s.owner = eo.employeeId INNER JOIN employee cb ON s.createdBy = cb.employeeId;'

  db.query(query, (err, data) => {
    if (err) {
      res.status(400).send(new ApiError(500, 'Error retrieving stages'))
    }
    const stages = data.map((stage) => ({
      ...stage,
      startDate: stage.startDate
        ? new Date(stage.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: stage.endDate
        ? new Date(stage.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: stage.executedStartDate
        ? new Date(stage.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: stage.executedEndDate
        ? new Date(stage.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(new ApiResponse(200, stages, 'Stages retrieved successfully.'))
  })
})

export const getActiveStagesByProjectNumber = asyncHandler(async (req, res) => {
  const pNo = req.params.id
  const query = `SELECT s.*, eo.customEmployeeId AS ownerId , cb.employeeName AS createdBy,eo.employeeName AS owner,cb.customEmployeeId AS createdById 
     FROM stage s
     INNER JOIN employee eo ON s.owner = eo.employeeId
     INNER JOIN employee cb ON s.createdBy = cb.employeeId
     WHERE s.projectNumber = ? 
     AND s.historyOf IS NULL;`

  db.query(query, [pNo], (err, data) => {
    if (err) {
      console.error('Error retrieving active stages:', err)
      return res
        .status(500)
        .send(new ApiError(500, 'Error retrieving active stages'))
    }

    // Helper function to order stages based on seqPrevStage
    const orderStages = (stages) => {
      const stageMap = new Map()
      let firstStage = null

      // Create a map of stages by id and find the first stage (where seqPrevStage is null)
      stages.forEach((stage) => {
        stageMap.set(stage.stageId, stage)
        if (!stage.seqPrevStage) {
          firstStage = stage // First stage found (no previous stage)
        }
      })

      if (!firstStage) {
        return [] // If no first stage, return empty
      }

      const orderedStages = []
      let currentStage = firstStage

      // Iteratively add stages in order by following seqPrevStage
      while (currentStage) {
        orderedStages.push(currentStage)

        // Move to the next stage where seqPrevStage matches the current stage id
        currentStage = stages.find(
          (stage) => stage.seqPrevStage === currentStage.stageId
        )
      }

      return orderedStages
    }

    // Convert dates and prepare stages
    const stages = data.map((stage) => ({
      ...stage,
      startDate: stage.startDate
        ? new Date(stage.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: stage.endDate
        ? new Date(stage.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: stage.executedStartDate
        ? new Date(stage.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: stage.executedEndDate
        ? new Date(stage.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))

    // Get stages in order based on seqPrevStage
    const orderedStages = orderStages(stages)

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          orderedStages,
          'Active stages retrieved successfully.'
        )
      )
  })
})

export const getHistoryStagesByStageId = asyncHandler(async (req, res) => {
  const sId = req.params.id
  const query = `SELECT s.*, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdByIds
                 FROM stage s
                 INNER JOIN employee eo ON s.owner = eo.employeeId
                 INNER JOIN employee cb ON s.createdBy = cb.employeeId
                 WHERE s.historyOf = ? 
                 ORDER BY s.timestamp;`

  db.query(query, [sId], (err, data) => {
    if (err) {
      console.error('Error retrieving history stages:', err)
      return res
        .status(500)
        .send(new ApiError(500, 'Error retrieving history stages'))
    }
    const stages = data.map((stage) => ({
      ...stage,
      startDate: stage.startDate
        ? new Date(stage.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: stage.endDate
        ? new Date(stage.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: stage.executedStartDate
        ? new Date(stage.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: stage.executedEndDate
        ? new Date(stage.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(
        new ApiResponse(200, stages, 'History stages retrieved successfully.')
      )
  })
})

// Get stage by stage ID
export const getSingleStageByStageId = asyncHandler(async (req, res) => {
  const stageId = req.params.id
  const query = `
          SELECT s.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
          FROM stage s
          INNER JOIN employee eo ON s.owner = eo.employeeId
          INNER JOIN employee cb ON s.createdBy = cb.employeeId
          WHERE s.stageId = ?;`

  db.query(query, [stageId], (err, data) => {
    if (err) {
      res.status(200).send(new ApiError(500, 'Error retrieving stage'))
      return
    }

    if (data.length === 0) {
      res.status(200).send(new ApiError(404, 'Stage not found'))
      return
    }
    const stages = data.map((stage) => ({
      ...stage,
      startDate: stage.startDate
        ? new Date(stage.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: stage.endDate
        ? new Date(stage.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: stage.executedStartDate
        ? new Date(stage.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: stage.executedEndDate
        ? new Date(stage.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))

    res
      .status(200)
      .json(new ApiResponse(200, stages[0], 'Stage retrieved successfully.'))
  })
})

// Get stages by ProjectNumber
export const getStagesByProjectNumber = asyncHandler(async (req, res) => {
  // console.log(req.params)

  const projectNumber = req.params.projectNumber
  const query = `SELECT s.*, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
                 FROM stage s
                 INNER JOIN employee eo ON s.owner = eo.employeeId
                 INNER JOIN employee cb ON s.createdBy = cb.employeeId
                 WHERE s.projectNumber = ?;`

  db.query(query, [projectNumber], (err, data) => {
    if (err) {
      res.status(200).send(new ApiError(500, 'Error retrieving stage'))
      return
    }

    if (data.length === 0) {
      res.status(200).send(new ApiError(404, 'Stage not found'))
      return
    }

    const stages = data.map((stage) => ({
      ...stage,
      startDate: stage.startDate
        ? new Date(stage.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: stage.endDate
        ? new Date(stage.endDate).toLocaleDateString('en-CA')
        : null,
      executedStartDate: stage.executedStartDate
        ? new Date(stage.executedStartDate).toLocaleDateString('en-CA')
        : null,
      executedEndDate: stage.executedEndDate
        ? new Date(stage.executedEndDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(new ApiResponse(200, stages, 'Stage retrieved successfully.'))
  })
})

//create stage
export const createStage = asyncHandler(async (req, res) => {
  const {
    projectNumber,
    stageName,
    startDate,
    endDate,
    owner,
    machine,
    duration,
    seqPrevStage,
    progress,
  } = req.body

  // Basic validation check
  if (!projectNumber || !stageName || !owner) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Missing required fields'))
  }

  // Extract customEmployeeId from owner field
  const match = owner.match(/\(([^)]+)\)/) // Extracts customEmployeeId
  const customEmployeeId = match ? match[1] : null

  if (!customEmployeeId) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          'Invalid owner format, customEmployeeId not found.'
        )
      )
  }

  // Query to find the corresponding employeeId
  const checkOwnerQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
  db.query(checkOwnerQuery, [customEmployeeId], (err, result) => {
    if (err) {
      console.error('Error checking owner:', err)
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

    const query = `INSERT INTO stage (
      projectNumber, stageName, startDate, endDate, owner, machine, duration, 
      seqPrevStage, createdBy, progress
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const values = [
      projectNumber,
      stageName,
      startDate,
      endDate,
      employeeId, // Use employeeId instead of customEmployeeId
      machine,
      duration,
      seqPrevStage,
      req.user[0].employeeId,
      progress,
    ]

    db.query(query, values, (err, data) => {
      if (err) {
        console.error('Error creating stage:', err)
        return res
          .status(500)
          .json(new ApiResponse(500, null, 'Error creating stage'))
      }
      res
        .status(201)
        .json(new ApiResponse(201, data, 'Stage created successfully'))
    })
  })
})

// Delete a stage and update subsequent stages
export const deleteStage = asyncHandler(async (req, res) => {
  const stageId = req.params.id

  try {
    // Find the previous stage of the stage to be deleted
    const findPrevStageQuery =
      'SELECT seqPrevStage FROM stage WHERE stageId = ?'
    const [prevStageData] = await db
      .promise()
      .query(findPrevStageQuery, [stageId])

    if (prevStageData.length === 0) {
      console.error(`Stage with ID ${stageId} not found`)
      return res.status(404).send(new ApiError(404, 'Stage not found'))
    }

    const prevStageId = prevStageData[0].seqPrevStage

    // Update subsequent stages to point to the previous stage
    const updateSubsequentStagesQuery =
      'UPDATE stage SET seqPrevStage = ? WHERE seqPrevStage = ?'
    const [updateResult] = await db
      .promise()
      .query(updateSubsequentStagesQuery, [prevStageId, stageId])

    // console.log(`Updated ${updateResult.affectedRows} subsequent stages`)

    // Delete associated substages first (including their history)
    const deleteSubstagesQuery = 'DELETE FROM substage WHERE stageId = ?'
    await db.promise().query(deleteSubstagesQuery, [stageId])

    // Delete the stage
    const deleteStageQuery =
      'DELETE FROM stage WHERE stageId = ? OR historyOf=?'
    const [deleteResult] = await db
      .promise()
      .query(deleteStageQuery, [stageId, stageId])

    if (deleteResult.affectedRows === 0) {
      console.error(`Failed to delete stage with ID ${stageId}`)
      return res.status(404).send(new ApiError(404, 'Stage not found'))
    }

    // Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stageId,
          'Stage deleted and subsequent stages updated successfully.'
        )
      )
  } catch (err) {
    console.error(err)
    res.status(500).send(new ApiError(500, 'Error deleting stage'))
  }
})

//update stage and store history
export const updateStage = asyncHandler(async (req, res) => {
  const stageId = req.params.id

  const selectQuery = `SELECT * FROM stage WHERE stageId = ?`
  const insertQuery = `INSERT INTO stage (
    projectNumber, stageName, startDate, endDate, owner, machine, duration, 
    seqPrevStage, createdBy, progress, historyOf, updateReason
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  const updateQuery = `UPDATE stage SET 
    projectNumber = ?, stageName = ?, startDate = ?, endDate = ?, 
    owner = ?, machine = ?, duration = ?, seqPrevStage = ?,  
    createdBy = ?, progress = ?, timestamp = ?, historyOf = NULL
    WHERE stageId = ?`

  db.query(selectQuery, [stageId], (err, stageData) => {
    if (err) {
      console.log(err)
      return res.status(500).send(new ApiError(500, 'Error retrieving stage'))
    }

    if (stageData.length === 0) {
      return res.status(404).send(new ApiError(404, 'Stage not found'))
    }

    const stage = stageData[0]

    const isChanged = Object.keys(req.body).some(
      (key) => stage[key] !== req.body[key]
    )

    if (!isChanged) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, 'No changes detected. No action taken.')
        )
    }

    // Extract customEmployeeId from owner field
    const match = req.body.owner ? req.body.owner.match(/\(([^)]+)\)/) : null
    const customEmployeeId = match ? match[1] : null

    if (customEmployeeId) {
      // Query to find the corresponding employeeId
      const checkOwnerQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
      db.query(checkOwnerQuery, [customEmployeeId], (err, result) => {
        if (err) {
          // console.log('Error checking owner:', err)
          return res
            .status(500)
            .json(new ApiResponse(500, null, 'Error checking owner'))
        }
        if (result.length === 0) {
          return res
            .status(400)
            .json(
              new ApiResponse(400, null, 'Owner not found in employee table')
            )
        }

        const employeeId = result[0].employeeId

        const insertValues = [
          stage.projectNumber,
          stage.stageName,
          stage.startDate,
          stage.endDate,
          stage.owner,
          stage.machine,
          stage.duration,
          stage.seqPrevStage,
          stage.createdBy,
          stage.progress,
          stageId, // historyOf should store the stageId
          req.body.updateReason, // Pass the reason for the update
        ]

        db.query(insertQuery, insertValues, (err, insertData) => {
          if (err) {
            console.log(err)
            return res
              .status(500)
              .send(new ApiError(500, 'Error creating new stage in history'))
          }

          // console.log(req.body);
          const timestamp = new Date(req.body.timestamp)
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
          const updateValues = [
            req.body.projectNumber,
            req.body.stageName,
            req.body.startDate,
            req.body.endDate,
            employeeId, // Use employeeId for owner
            req.body.machine,
            req.body.duration,
            req.body.seqPrevStage,
            req.user[0].employeeId,
            req.body.progress,
            timestamp,
            stageId,
          ]

          db.query(updateQuery, updateValues, (err, updateData) => {
            if (err) {
              console.log(err)
              return res
                .status(500)
                .send(new ApiError(500, 'Error updating stage'))
            }

            res
              .status(200)
              .json(
                new ApiResponse(200, updateData, 'Stage updated successfully.')
              )
          })
        })
      })
    } else {
      // If customEmployeeId not found in owner, proceed with the existing owner
      const insertValues = [
        stage.projectNumber,
        stage.stageName,
        stage.startDate,
        stage.endDate,
        stage.owner,
        stage.machine,
        stage.duration,
        stage.seqPrevStage,
        stage.createdBy,
        stage.progress,
        stageId, // historyOf should store the stageId
        req.body.updateReason, // Pass the reason for the update
      ]

      db.query(insertQuery, insertValues, (err, insertData) => {
        if (err) {
          console.log(err)
          return res
            .status(500)
            .send(new ApiError(500, 'Error creating new stage in history'))
        }

        const updateValues = [
          req.body.projectNumber,
          req.body.stageName,
          req.body.startDate,
          req.body.endDate,
          req.body.owner, // Keep the original owner if customEmployeeId is not provided
          req.body.machine,
          req.body.duration,
          req.body.seqPrevStage,
          req.user[0].employeeId,
          req.body.progress,
          req.body.timestamp,
          stageId,
        ]

        db.query(updateQuery, updateValues, (err, updateData) => {
          if (err) {
            console.log(err)
            return res
              .status(500)
              .send(new ApiError(500, 'Error updating stage'))
          }

          res
            .status(200)
            .json(
              new ApiResponse(200, updateData, 'Stage updated successfully.')
            )
        })
      })
    }
  })
})

// Update stage progress manually (0-100) + recalculate project progress
export const updateStageProgress = asyncHandler(async (req, res) => {
  const stageId = req.params.id
  const { progress, executedStartDate, executedEndDate } = req.body

  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json(new ApiResponse(400, null, 'Progress must be between 0 and 100'))
  }

  const newProgress = Math.round(progress)

  // If setting to 100%, verify all substages are completed first
  if (newProgress >= 100) {
    const checkQuery = `SELECT COUNT(*) as total, SUM(CASE WHEN progress >= 100 THEN 1 ELSE 0 END) as completed FROM substage WHERE stageId = ? AND historyOf IS NULL`
    const [checkResult] = await db.promise().query(checkQuery, [stageId])
    const total = checkResult[0]?.total || 0
    const completed = checkResult[0]?.completed || 0
    if (total > 0 && completed < total) {
      return res.status(400).json(new ApiResponse(400, null, `Cannot set stage to 100% — only ${completed}/${total} substages are complete.`))
    }
  }

  const execStart = newProgress >= 100 && executedStartDate ? executedStartDate : null
  const execEnd = newProgress >= 100 && executedEndDate ? executedEndDate : null

  // 1. Update stage progress + executed dates
  const updateQuery = `UPDATE stage SET progress = ?, executedStartDate = ?, executedEndDate = ? WHERE stageId = ?`
  db.query(updateQuery, [newProgress, execStart, execEnd, stageId], (err, result) => {
    if (err) {
      console.error('Error updating stage progress:', err)
      return res.status(500).send(new ApiError(500, 'Error updating stage progress'))
    }
    if (result.affectedRows === 0) {
      return res.status(404).send(new ApiError(404, 'Stage not found'))
    }

    // 2. Get the projectNumber for this stage
    db.query('SELECT projectNumber FROM stage WHERE stageId = ?', [stageId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(200).json(new ApiResponse(200, { stageId, progress: newProgress }, 'Stage progress updated.'))
      }

      const projectNumber = rows[0].projectNumber

      if (!projectNumber) {
        return res.status(200).json(new ApiResponse(200, { stageId, progress: newProgress }, 'Stage progress updated.'))
      }

      // 3. Recalculate project progress = avg of stage progresses
      db.query(
        'SELECT AVG(progress) as avgProgress FROM stage WHERE projectNumber = ? AND historyOf IS NULL',
        [projectNumber],
        (err, projStats) => {
          if (err || projStats.length === 0) {
            return res.status(200).json(new ApiResponse(200, { stageId, progress: newProgress }, 'Stage progress updated.'))
          }

          const projectProgress = Math.round(projStats[0].avgProgress || 0)

          // 4. Auto-compute project executed dates
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

            // 5. Auto-set projectStatus
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
                    stageId, progress: newProgress, projectProgress,
                    projectStatus: newStatus,
                  }, 'Stage progress updated successfully.')
                )
              })
            })
          })
        }
      )
    })
  })
})
