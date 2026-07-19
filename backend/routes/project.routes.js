import express from 'express'
import { Router } from 'express'
import {
  getAllProjects,
  getProjectById,
  createProject,
  deleteProject,
  updateProject,
  getActiveProjects,
  getHistoricalProjects,
  getCompanyList,
  getProjectHistory,
  getStuckStagesForProjects,
  getProjectsByEmployeeId,
} from '../controllers/project.controller.js'
import { upload } from '../utils/multer.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireProjectAccess } from '../middleware/projectAccessMiddleware.js'
const router = Router()

router.get('/project/companyList', authMiddleware, requireProjectAccess('project', 'read'), getCompanyList)
router.get('/activeProjects', authMiddleware, requireProjectAccess('project', 'read'), getActiveProjects) //tested
router.get('/historyProjects/:pNo', authMiddleware, requireProjectAccess('project', 'read'), getHistoricalProjects) //tested
router.get('/projects', authMiddleware, requireProjectAccess('project', 'read'), getAllProjects) //tested
router.post(
  '/projects/stuck-stages',
  authMiddleware,
  requireProjectAccess('project', 'read'),
  getStuckStagesForProjects
)
router.get('/projects/employee/:employeeId', authMiddleware, requireProjectAccess('project', 'read'), getProjectsByEmployeeId) // Get projects by employee
router.get('/projects/:id', authMiddleware, requireProjectAccess('project', 'read'), getProjectById) //tested
router.post(
  '/projects',
  upload.fields([
    { name: 'projectPOLink', maxCount: 1 },
    { name: 'projectDesignDocLink', maxCount: 1 },
  ]),
  authMiddleware,
  requireProjectAccess('project', 'add'),
  createProject
)
router.delete(
  '/projects/:id',
  authMiddleware,
  requireProjectAccess('project', 'delete'),
  deleteProject
) //tested
router.put(
  '/projects/:id',
  upload.fields([
    { name: 'projectPOLink', maxCount: 1 },
    { name: 'projectDesignDocLink', maxCount: 1 },
  ]),
  authMiddleware,
  requireProjectAccess('project', 'update'),
  updateProject
) //tested
router.get(
  '/projects/:id/history',
  authMiddleware,
  requireProjectAccess('project', 'read'),
  getProjectHistory
)

export default router
