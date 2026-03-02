import express from 'express'
import { getAllSubstagesMaster, createSubstageMaster, deleteSubstageMaster, updateSubstageMaster } from '../controllers/substagesMaster.controller.js'

const router = express.Router()

router.get('/substages', getAllSubstagesMaster)
router.post('/substages', createSubstageMaster)
router.put('/substages/:id', updateSubstageMaster)
router.delete('/substages/:id', deleteSubstageMaster)

export default router


