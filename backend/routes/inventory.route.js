import express from 'express'
import {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventory.controller.js'

const router = express.Router()

// GET all inventory items
router.get('/', getAllInventoryItems)

// GET a single inventory item by ID
router.get('/:itemId', getInventoryItemById)

// POST a new inventory item
router.post('/', createInventoryItem)

// PUT update inventory item
router.put('/:itemId', updateInventoryItem)

// DELETE inventory item
router.delete('/:itemId', deleteInventoryItem)

export default router
