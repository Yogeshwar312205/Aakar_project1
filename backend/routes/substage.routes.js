import express from 'express'
import {
  getSubStagesByStageId,
  getSubStagesByProjectNumber,
  createSubStage,
  updateSubStage,
  getActiveSubStagesByStageId,
  getHistorySubStagesBySubStageId,
  deleteSubStage,
  getSingleSubStageById,
  getSubStageChildren,
  toggleSubStageCompletion,
  updateSubStageProgress,
} from '../controllers/substage.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireProjectAccess } from '../middleware/projectAccessMiddleware.js'

const router = express.Router()

router.post('/subStages', authMiddleware, requireProjectAccess('substage', 'add'), createSubStage) //tested
router.get('/activeSubStages/:id', authMiddleware, requireProjectAccess('substage', 'read'), getActiveSubStagesByStageId) //tested
router.get('/historySubStages/:id', authMiddleware, requireProjectAccess('substage', 'read'), getHistorySubStagesBySubStageId) //tested
router.get('/subStage/:id', authMiddleware, requireProjectAccess('substage', 'read'), getSingleSubStageById)
router.get('/subStages/children/:id', authMiddleware, requireProjectAccess('substage', 'read'), getSubStageChildren)
router.get('/subStages/:id', authMiddleware, requireProjectAccess('substage', 'read'), getSubStagesByStageId) //tested
router.get('/project/subStages/:projectNumber', authMiddleware, requireProjectAccess('substage', 'read'), getSubStagesByProjectNumber) //tested
router.put('/subStages/:id', authMiddleware, requireProjectAccess('substage', 'update'), updateSubStage) //tested
router.put('/subStages/:id/completion', authMiddleware, requireProjectAccess('substage', 'update'), toggleSubStageCompletion) // Toggle completion
router.put('/subStages/:id/progress', authMiddleware, requireProjectAccess('substage', 'update'), updateSubStageProgress) // Edit progress manually
router.delete('/subStages/:id', authMiddleware, requireProjectAccess('substage', 'delete'), deleteSubStage) //tested

export default router
