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
import { requireProjectAccess } from '../middleware/projectAccessMiddleware.js'
import { rbacMiddleware } from '../middleware/rbacMiddleware.js'

const router = express.Router()

router.get('/stages/list', authMiddleware, requireProjectAccess('stage', 'read'), getStageList) //tested
router.get('/stages', authMiddleware, requireProjectAccess('stage', 'read'), getAllStages) //tested
router.get('/stage/:id', authMiddleware, requireProjectAccess('stage', 'read'), rbacMiddleware, getSingleStageByStageId) //tested
router.get('/stages/:projectNumber', authMiddleware, requireProjectAccess('stage', 'read'), getStagesByProjectNumber) //tetsed
router.get('/historyStages/:id', authMiddleware, requireProjectAccess('stage', 'read'), getHistoryStagesByStageId) //tested
router.get('/activeStages/:id', authMiddleware, requireProjectAccess('stage', 'read'), rbacMiddleware, getActiveStagesByProjectNumber) //tested

router.post('/stages', authMiddleware, requireProjectAccess('stage', 'add'), createStage) //tested
router.delete('/stages/:id', authMiddleware, requireProjectAccess('stage', 'delete'), deleteStage) //tested
router.put('/stages/:id', authMiddleware, requireProjectAccess('stage', 'update'), rbacMiddleware, updateStage) //tested
router.put('/stages/:id/progress', authMiddleware, requireProjectAccess('stage', 'update'), updateStageProgress) // Edit progress manually

export default router
