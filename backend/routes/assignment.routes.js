import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireProjectAccess } from '../middleware/projectAccessMiddleware.js'
import {
  createAssignment,
  getAssignmentsByProject,
  deleteAssignment
} from '../controllers/assignment.controller.js'

const router = express.Router()

// All assignment routes require authentication and project module read access
router.use(authMiddleware)
router.use(requireProjectAccess('project', 'read'))

// Create assignment (Manager only - enforced in controller)
router.post('/', createAssignment)

// Get assignments for a project
router.get('/project/:projectNumber', getAssignmentsByProject)

// Delete assignment (Manager only - enforced in controller)
router.delete('/:assignmentId', deleteAssignment)

export default router
