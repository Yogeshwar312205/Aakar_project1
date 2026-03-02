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
} from '../controllers/substage.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/subStages', authMiddleware, createSubStage) //tested
router.get('/activeSubStages/:id', getActiveSubStagesByStageId) //tested
router.get('/historySubStages/:id', getHistorySubStagesBySubStageId) //tested
router.get('/subStage/:id', getSingleSubStageById)
router.get('/subStages/children/:id', getSubStageChildren)
router.get('/subStages/:id', getSubStagesByStageId) //tested
router.get('/project/subStages/:projectNumber', getSubStagesByProjectNumber) //tested
router.put('/subStages/:id', authMiddleware, updateSubStage) //tested
router.put('/subStages/:id/completion', toggleSubStageCompletion) // Toggle completion
router.delete('/subStages/:id', deleteSubStage) //tested

export default router
