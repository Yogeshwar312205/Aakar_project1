import express from 'express'
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
} from '../controllers/stageTemplate.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/templates', getAllTemplates)
router.get('/templates/:id', getTemplateById)
router.post('/templates', authMiddleware, createTemplate)
router.put('/templates/:id', authMiddleware, updateTemplate)
router.delete('/templates/:id', deleteTemplate)
router.post('/templates/:id/apply', authMiddleware, applyTemplate)

export default router
