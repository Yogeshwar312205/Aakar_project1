import express from 'express'
import {
  getStageList,
  getAllStages,
  getSingleStageByStageId,
  getStagesByProjectNumber,
  createStage,
  deleteStage,
  updateStage,
  getHistoryStagesByStageId,
  getActiveStagesByProjectNumber,
  updateStageProgress,
} from '../controllers/stage.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/stages/list', getStageList) //tested
router.get('/stages', getAllStages) //tested
router.get('/stage/:id', getSingleStageByStageId) //tested
router.get('/stages/:projectNumber', getStagesByProjectNumber) //tetsed
router.get('/historyStages/:id', getHistoryStagesByStageId) //tested
router.get('/activeStages/:id', getActiveStagesByProjectNumber) //tested

router.post('/stages', authMiddleware, createStage) //tested
router.delete('/stages/:id', deleteStage) //tested
router.put('/stages/:id', authMiddleware, updateStage) //tested
router.put('/stages/:id/progress', updateStageProgress) // Edit progress manually

export default router
