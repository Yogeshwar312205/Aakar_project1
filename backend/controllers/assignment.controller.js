import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

// Create assignment (Manager only)
export const createAssignment = asyncHandler(async (req, res) => {
  const { projectNumber, stageId, substageId, employeeId } = req.body
  const assignedBy = req.user[0].employeeId

  // Validate: either stageId or substageId, not both
  if ((stageId && substageId) || (!stageId && !substageId)) {
    return res
      .status(400)
      .send(
        new ApiError(
          400,
          'Exactly one of stageId or substageId must be provided'
        )
      )
  }

  // Verify user is Manager of this project
  const [projectData] = await db
    .promise()
    .query('SELECT projectCreatedBy FROM project WHERE projectNumber = ?', [
      projectNumber,
    ])

  if (!projectData || projectData.length === 0) {
    return res.status(404).send(new ApiError(404, 'Project not found'))
  }

  if (projectData[0]?.projectCreatedBy !== assignedBy) {
    return res
      .status(403)
      .send(new ApiError(403, 'Only project managers can create assignments'))
  }

  const query = `
    INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy)
    VALUES (?, ?, ?, ?, ?)
  `

  db.query(
    query,
    [projectNumber, stageId || null, substageId || null, employeeId, assignedBy],
    (err, result) => {
      if (err) {
        console.error('Error creating assignment:', err)
        return res
          .status(500)
          .send(new ApiError(500, 'Error creating assignment'))
      }

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { assignmentId: result.insertId },
            'Assignment created successfully'
          )
        )
    }
  )
})

// Get all assignments for a project
export const getAssignmentsByProject = asyncHandler(async (req, res) => {
  const { projectNumber } = req.params

  const query = `
    SELECT sa.*, e.employeeName, e.customEmployeeId,
           s.stageName, ss.substageName,
           ab.employeeName as assignedByName
    FROM stage_assignment sa
    INNER JOIN employee e ON sa.employeeId = e.employeeId
    LEFT JOIN stage s ON sa.stageId = s.stageId
    LEFT JOIN substage ss ON sa.substageId = ss.substageId
    INNER JOIN employee ab ON sa.assignedBy = ab.employeeId
    WHERE sa.projectNumber = ?
    ORDER BY sa.assignedDate DESC
  `

  db.query(query, [projectNumber], (err, data) => {
    if (err) {
      console.error('Error fetching assignments:', err)
      return res
        .status(500)
        .send(new ApiError(500, 'Error fetching assignments'))
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, data, 'Assignments retrieved successfully')
      )
  })
})

// Delete assignment (Manager only)
export const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params
  const requesterId = req.user[0].employeeId

  // Verify user is Manager of this assignment's project
  const [assignmentData] = await db.promise().query(
    `SELECT sa.projectNumber, p.projectCreatedBy
     FROM stage_assignment sa
     INNER JOIN project p ON sa.projectNumber = p.projectNumber
     WHERE sa.assignmentId = ?`,
    [assignmentId]
  )

  if (!assignmentData || assignmentData.length === 0) {
    return res.status(404).send(new ApiError(404, 'Assignment not found'))
  }

  if (assignmentData[0].projectCreatedBy !== requesterId) {
    return res
      .status(403)
      .send(new ApiError(403, 'Only project managers can delete assignments'))
  }

  db.query(
    'DELETE FROM stage_assignment WHERE assignmentId = ?',
    [assignmentId],
    (err) => {
      if (err) {
        console.error('Error deleting assignment:', err)
        return res
          .status(500)
          .send(new ApiError(500, 'Error deleting assignment'))
      }

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { assignmentId },
            'Assignment deleted successfully'
          )
        )
    }
  )
})
