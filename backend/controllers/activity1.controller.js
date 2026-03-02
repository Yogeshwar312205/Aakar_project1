import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

// Get activities by substage ID
export const getActivitiesBySubStageId = asyncHandler(async (req, res) => {
  const subStageId = req.params.id
  console.log("Substage ID: ", subStageId)
  // First check whether the `activity` table has a `substageId` column.
  // If it does, include results from both tables (UNION). If not, query only `substage_activity`.
  const checkColumnQuery = `SHOW COLUMNS FROM activity LIKE 'substageId'`

  db.query(checkColumnQuery, (colErr, colData) => {
    if (colErr) {
      console.error('Error checking activity table columns', colErr)
      return res.status(500).send(new ApiError(500, 'Error retrieving activities'))
    }

    const activityHasSubstage = Array.isArray(colData) && colData.length > 0

    let query
    let params
    if (activityHasSubstage) {
      query = `
        SELECT a.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
        FROM substage_activity a
        LEFT JOIN employee eo ON a.owner = eo.employeeId
        LEFT JOIN employee cb ON a.createdBy = cb.employeeId
        WHERE a.substageId = ?
        UNION
        SELECT b.*, eo2.employeeName AS owner, cb2.employeeName AS createdBy, eo2.customEmployeeId AS ownerId, cb2.customEmployeeId AS createdById
        FROM activity b
        LEFT JOIN employee eo2 ON b.owner = eo2.employeeId
        LEFT JOIN employee cb2 ON b.createdBy = cb2.employeeId
        WHERE b.substageId = ?
      `
      params = [subStageId, subStageId]
    } else {
      query = `
        SELECT a.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
        FROM substage_activity a
        LEFT JOIN employee eo ON a.owner = eo.employeeId
        LEFT JOIN employee cb ON a.createdBy = cb.employeeId
        WHERE a.substageId = ?
      `
      params = [subStageId]
    }

    db.query(query, params, (err, data) => {
      if (err) {
        console.log('error: ' , err)
        res.status(500).send(new ApiError(500, 'Error retrieving activities'))
        return
      }
      if (!data || data.length === 0) {
        // Return empty data array instead of 404 so frontend receives consistent shape
        return res.status(200).json(new ApiResponse(304, [], 'No activities found'))
      }
      const activities = data.map((activity) => ({
        ...activity,
        startDate: activity.startDate
          ? new Date(activity.startDate).toLocaleDateString('en-CA')
          : null,
        endDate: activity.endDate
          ? new Date(activity.endDate).toLocaleDateString('en-CA')
          : null,
      }))
      res
        .status(200)
        .json(new ApiResponse(200, activities, 'Activities retrieved successfully.'))
    })
  })
})

// Get history activities by activity ID
export const getHistoryActivitiesByActivityId = asyncHandler(async (req, res) => {
  const activityId = req.params.id
  const query = `SELECT a.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
    FROM activity1 a
    INNER JOIN employee eo ON a.owner = eo.employeeId
    INNER JOIN employee cb ON a.createdBy = cb.employeeId
    WHERE a.historyOf = ?
    ORDER BY a.timestamp DESC;`

  db.query(query, [activityId], (err, data) => {
    if (err) {
      res.status(500).send(new ApiError(500, 'Error retrieving history activities'))
      return
    }
    if (data.length === 0) {
      res.status(404).send(new ApiError(404, 'No history activities found'))
      return
    }
    const activities = data.map((activity) => ({
      ...activity,
      startDate: activity.startDate
        ? new Date(activity.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: activity.endDate
        ? new Date(activity.endDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(new ApiResponse(200, activities, 'History activities retrieved successfully.'))
  })
})

// Get active activities by substage ID
export const getActiveActivitiesBySubStageId = asyncHandler(async (req, res) => {
  const subStageId = req.params.id
  console.debug('getActiveActivitiesBySubStageId called with id:', subStageId)
  // First check whether the `activity` table has a `substageId` column.
  const checkColumnQuery = `SHOW COLUMNS FROM activity LIKE 'substageId'`

  db.query(checkColumnQuery, (colErr, colData) => {
    if (colErr) {
      console.error('Error checking activity table columns', colErr)
      return res.status(500).send(new ApiError(500, 'Error retrieving active activities'))
    }

    const activityHasSubstage = Array.isArray(colData) && colData.length > 0

    let query
    let params
    if (activityHasSubstage) {
      query = `
        SELECT a.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
        FROM substage_activity a
        LEFT JOIN employee eo ON a.owner = eo.employeeId
        LEFT JOIN employee cb ON a.createdBy = cb.employeeId
        WHERE a.substageId = ?
        UNION
        SELECT b.*, eo2.employeeName AS owner, cb2.employeeName AS createdBy, eo2.customEmployeeId AS ownerId, cb2.customEmployeeId AS createdById
        FROM activity b
        LEFT JOIN employee eo2 ON b.owner = eo2.employeeId
        LEFT JOIN employee cb2 ON b.createdBy = cb2.employeeId
        WHERE b.substageId = ?
      `
      params = [subStageId, subStageId]
    } else {
      query = `
        SELECT a.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
        FROM substage_activity a
        LEFT JOIN employee eo ON a.owner = eo.employeeId
        LEFT JOIN employee cb ON a.createdBy = cb.employeeId
        WHERE a.substageId = ?
      `
      params = [subStageId]
    }

    console.debug('Executing query for active activities, subStageId =', subStageId, 'activityHasSubstage=', activityHasSubstage)

    db.query(query, params, (err, data) => {
      if (err) {
        console.error('Error retrieving active activities for subStageId:', subStageId, err)
        res.status(500).send(new ApiError(500, 'Error retrieving active activities'))
        return
      }

      console.debug(`Query returned rows=${Array.isArray(data) ? data.length : 0} for subStageId=${subStageId}`)

      if (!data || data.length === 0) {
        console.debug('No active activities found for subStageId:', subStageId)
        return res.status(200).json(new ApiResponse(200, [], 'No active activities found'))
      }

      const activities = data.map((activity) => ({
        ...activity,
        startDate: activity.startDate
          ? new Date(activity.startDate).toLocaleDateString('en-CA')
          : null,
        endDate: activity.endDate
          ? new Date(activity.endDate).toLocaleDateString('en-CA')
          : null,
      }))

      console.debug('Returning activities sample (up to 3):', (activities || []).slice(0, 3))
      res
        .status(200)
        .json(new ApiResponse(200, activities, 'Active activities retrieved successfully.'))
    })
  })
})

// Get activities by project number
export const getActivitiesByProjectNumber = asyncHandler(async (req, res) => {
  const projectNumber = req.params.projectNumber
  const query = `SELECT a.*, eo.employeeName AS owner, cb.employeeName AS createdBy, eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
    FROM activity1 a
    INNER JOIN employee eo ON a.owner = eo.employeeId
    INNER JOIN employee cb ON a.createdBy = cb.employeeId
    WHERE a.projectNumber = ?;`

  db.query(query, [projectNumber], (err, data) => {
    if (err) {
      res.status(500).send(new ApiError(500, 'Error retrieving activities'))
      return
    }
    if (data.length === 0) {
      res.status(404).send(new ApiError(404, 'No activities found'))
      return
    }
    const activities = data.map((activity) => ({
      ...activity,
      startDate: activity.startDate
        ? new Date(activity.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: activity.endDate
        ? new Date(activity.endDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(new ApiResponse(200, activities, 'Activities retrieved successfully.'))
  })
})

// Update activity and store history
export const updateActivity1 = asyncHandler(async (req, res) => {
  const activityId = req.params.id
  console.log("Activity ID to update: ", activityId)
  if (!activityId) {
    return res.status(400).send(new ApiError(400, 'Activity ID is required'))
  }

  const selectQuery = `SELECT * FROM substage_activity WHERE activityId = ?`
  const insertQuery = `
    INSERT INTO activity (
      subStageId, activityName, startDate, endDate, owner, machine, duration, 
      seqPrevActivity, createdBy, progress, historyOf, updateReason, projectNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  const updateQuery = `
    UPDATE activity SET 
      subStageId = ?, activityName = ?, startDate = ?, endDate = ?, 
      owner = ?, machine = ?, duration = ?, seqPrevActivity = ?, 
      createdBy = ?, timestamp = ?, progress = ?, historyOf = NULL
    WHERE activityId = ?
  `

  console.log("Req body: ", req.body)

  db.query(selectQuery, [activityId], (err, activityData) => {
    if (err) {
      console.log("Error retrieving activity: ", err)
      return res.status(500).send(new ApiError(500, 'Error retrieving activity'))
    }
    if (activityData.length === 0) {
      console.log("Activity not found")
      return res.status(404).send(new ApiError(404, 'Activity not found'))
    }
    const activity = activityData[0]
    console.log("activity fetched: ", activity)

    // Extract customEmployeeId from the owner field
    const match = req.body.ownerId ? req.body.ownerId.match(/\(([^)]+)\)/) : null
    console.log("Match: ", match)
    const customEmployeeId = match ? match[1] : null

    console.log("Custom Employee ID: ", customEmployeeId)

    if (!customEmployeeId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'customEmployeeId is required'))
    }

    // Query to find the corresponding employeeId
    const checkOwnerQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
    db.query(checkOwnerQuery, [customEmployeeId], (err, result) => {
      if (err) {
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

      // Create history for the activity
      const insertValues = [
        activity.subStageId,
        activity.activityName,
        activity.startDate,
        activity.endDate,
        activity.owner,
        activity.machine,
        activity.duration,
        activity.seqPrevActivity,
        activity.createdBy,
        activity.progress,
        activityId,
        req.body.updateReason || '',
        activity.projectNumber,
      ]

      // Prepare updated fields
      const updatedFields = {
        subStageId: req.body.subStageId || activity.subStageId,
        activityName: req.body.activityName || activity.activityName,
        startDate: req.body.startDate || activity.startDate,
        endDate: req.body.endDate || activity.endDate,
        owner: employeeId,
        machine: req.body.machine || activity.machine,
        duration: req.body.duration || activity.duration,
        seqPrevActivity: req.body.seqPrevActivity || activity.seqPrevActivity,
        createdBy: req.user[0].employeeId || activity.createdBy,
        timestamp: req.body.timestamp,
        progress: req.body.progress || activity.progress,
      }

      const isChanged = Object.keys(updatedFields).some(
        (key) => updatedFields[key] !== activity[key]
      )

      if (!isChanged) {
        return res
          .status(200)
          .json(new ApiResponse(200, null, 'No changes detected, activity not updated.'))
      }

      db.query(insertQuery, insertValues, (err) => {
        if (err) {
          return res
            .status(500)
            .send(new ApiError(500, 'Error creating new activity in history'))
        }

        const timestamp = new Date(req.body.timestamp)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', '')
        const updateValues = [
          updatedFields.subStageId,
          updatedFields.activityName,
          updatedFields.startDate,
          updatedFields.endDate,
          updatedFields.owner,
          updatedFields.machine,
          updatedFields.duration,
          updatedFields.seqPrevActivity,
          updatedFields.createdBy,
          timestamp,
          updatedFields.progress,
          activityId,
        ]

        db.query(updateQuery, updateValues, (err, updateData) => {
          if (err) {
            return res
              .status(500)
              .send(new ApiError(500, 'Error updating activity'))
          }
          res
            .status(200)
            .json(new ApiResponse(200, updateData, 'Activity updated successfully.'))
        })
      })
    })
  })
})

// Create activity
export const createActivity1 = asyncHandler(async (req, res) => {
  const match = req.body.owner ? req.body.owner.match(/\(([^)]+)\)/) : null
  const customEmployeeId = match ? match[1] : null

  if (!customEmployeeId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'customEmployeeId is required'))
  }

  const checkOwnerQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
  db.query(checkOwnerQuery, [customEmployeeId], (err, result) => {
    if (err) {
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

    const activityQuery = `INSERT INTO activity1 (
      subStageId, activityName, startDate, endDate, owner, machine, duration, 
      seqPrevActivity, createdBy, progress, projectNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const values = [
      req.body.subStageId,
      req.body.activityName,
      req.body.startDate,
      req.body.endDate,
      employeeId,
      req.body.machine,
      req.body.duration,
      req.body.seqPrevActivity,
      req.user[0].employeeId,
      req.body.progress,
      req.body.projectNumber,
    ]

    db.query(activityQuery, values, (err, data) => {
      if (err) {
        return res
          .status(500)
          .json(new ApiResponse(500, null, 'Error creating activity'))
      }
      res
        .status(201)
        .json(new ApiResponse(201, data, 'Activity created successfully'))
    })
  })
})

// Delete activity
export const deleteActivity1 = asyncHandler(async (req, res) => {
  const activityId = req.params.id

  try {
    const findPrevActivityQuery =
      'SELECT seqPrevActivity FROM activity1 WHERE activityId = ?'
    const [prevActivityData] = await db
      .promise()
      .query(findPrevActivityQuery, [activityId])

    if (prevActivityData.length === 0) {
      return res.status(404).send(new ApiError(404, 'Activity not found'))
    }

    const prevActivityId = prevActivityData[0].seqPrevActivity

    const updateSubsequentActivitiesQuery =
      'UPDATE activity1 SET seqPrevActivity = ? WHERE seqPrevActivity = ?'
    await db
      .promise()
      .query(updateSubsequentActivitiesQuery, [prevActivityId, activityId])

    const deleteActivityQuery = 'DELETE FROM activity1 WHERE activityId = ?'
    const [deleteResult] = await db
      .promise()
      .query(deleteActivityQuery, [activityId])

    if (deleteResult.affectedRows === 0) {
      return res.status(404).send(new ApiError(404, 'Activity not found'))
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activityId,
          'Activity deleted and subsequent activities updated successfully.'
        )
      )
  } catch (err) {
    res.status(500).send(new ApiError(500, 'Error deleting activity'))
  }
})

// Add mapping between substage and activity
export const addSubstageActivity = asyncHandler(async (req, res) => {
  const { substageId, activityName } = req.body
  if (!substageId || !activityName) {
    return res.status(400).json(new ApiResponse(400, null, 'substageId and activityName are required'))
  }

  // Check if a mapping already exists for this substageId + activityName
  const checkQuery = 'SELECT * FROM substage_activity WHERE substageId = ? AND activityName = ?'
  db.query(checkQuery, [substageId, activityName], (checkErr, checkRows) => {
    if (checkErr) {
      return res.status(500).json(new ApiResponse(500, null, 'Error checking existing mapping'))
    }
    if (checkRows && checkRows.length > 0) {
      // mapping already exists, return idempotent response
      return res.status(200).json(new ApiResponse(200, null, 'Mapping already exists'))
    }

    // Insert only substageId and activityName. Do not insert activity table id.
    const insertQuery = 'INSERT INTO substage_activity (substageId, activityName) VALUES (?, ?)'
    db.query(insertQuery, [substageId, activityName], (insErr, insResult) => {
      if (insErr) {
        return res.status(500).json(new ApiResponse(500, null, 'Error creating mapping'))
      }
      return res.status(201).json(new ApiResponse(201, { insertedId: insResult.insertId }, 'Mapping created'))
    })
  })
})

// Remove mapping between substage and activity
export const removeSubstageActivity = asyncHandler(async (req, res) => {
  const substageId = req.query.substageId || req.body.substageId
  const activityId = req.query.activityId || req.body.activityId
  const activityName = req.query.activityName || req.body.activityName
  if (!substageId || (!activityId && !activityName)) {
    return res.status(400).json(new ApiResponse(400, null, 'substageId and activityId or activityName required'))
  }

  if (activityId) {
    const deleteQuery = 'DELETE FROM substage_activity WHERE activityId = ? AND substageId = ?'
    db.query(deleteQuery, [activityId, substageId], (err, result) => {
      if (err) return res.status(500).json(new ApiResponse(500, null, 'Error deleting mapping'))
      if (result.affectedRows === 0) return res.status(404).json(new ApiResponse(404, null, 'Mapping not found'))
      return res.status(200).json(new ApiResponse(200, null, 'Mapping removed'))
    })
  } else {
    // delete by activityName and substageId
    const deleteQuery = 'DELETE FROM substage_activity WHERE activityName = ? AND substageId = ?'
    db.query(deleteQuery, [activityName, substageId], (err, result) => {
      if (err) return res.status(500).json(new ApiResponse(500, null, 'Error deleting mapping by name'))
      if (result.affectedRows === 0) return res.status(404).json(new ApiResponse(404, null, 'Mapping not found'))
      return res.status(200).json(new ApiResponse(200, null, 'Mapping removed by name'))
    })
  }
})