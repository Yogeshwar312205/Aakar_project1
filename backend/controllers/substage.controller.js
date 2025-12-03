import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

export const getSubStagesByStageId = asyncHandler(async (req, res) => {
  // console.log(req.params)

  const stageId = req.params.id
  const query = `SELECT ss.*, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
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
        : null, // Convert to local time
      endDate: substage.endDate
        ? new Date(substage.endDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
    }))
    res
      .status(200)
      .json(new ApiResponse(200, substages, 'Stage retrieved successfully.'))
  })
})

export const getHistorySubStagesBySubStageId = asyncHandler(
  async (req, res) => {
    const subStageId = req.params.id
    const query = `SELECT ss.*, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
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
          : null, // Convert to local time
        endDate: substage.endDate
          ? new Date(substage.endDate).toLocaleDateString('en-CA')
          : null, // Convert to local time
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
  const query = `SELECT ss.*, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
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
        : null, // Convert to local time
      endDate: substage.endDate
        ? new Date(substage.endDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
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
  const query = `SELECT ss.*, eo.employeeName AS owner, cb.employeeName AS createdBy,eo.customEmployeeId AS ownerId, cb.customEmployeeId AS createdById
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
        : null, // Convert to local time
      endDate: substage.endDate
        ? new Date(substage.endDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
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
      stageId, stageName, startDate, endDate, owner, machine, duration, 
      seqPrevStage, createdBy, progress, historyOf, updateReason, projectNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const updateQuery = `
    UPDATE substage SET 
      stageId = ?, stageName = ?, startDate = ?, endDate = ?, 
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
        substage.stageId,
        substage.stageName,
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
        stageId: req.body.stageId || substage.stageId,
        stageName: req.body.stageName || substage.stageName,
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
          updatedFields.stageId,
          updatedFields.stageName,
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
      stageId, stageName, startDate, endDate, owner, machine, duration, 
      seqPrevStage, createdBy, progress, projectNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const values = [
      req.body.stageId,
      req.body.stageName,
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
    const [updateResult] = await db
      .promise()
      .query(updateSubsequentSubStagesQuery, [prevSubStageId, substageId])

    // Delete the substage
    const deleteSubStageQuery = 'DELETE FROM substage WHERE substageId = ?'
    const [deleteResult] = await db
      .promise()
      .query(deleteSubStageQuery, [substageId])

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
          'Substage deleted and subsequent substages updated successfully.'
        )
      )
  } catch (err) {
    console.error(err)
    res.status(500).send(new ApiError(500, 'Error deleting substage'))
  }
})
