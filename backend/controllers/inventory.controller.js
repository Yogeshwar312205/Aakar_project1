import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

// GET all inventory items
export const getAllInventoryItems = asyncHandler(async (req, res) => {
  const query = `
    SELECT im.itemId, im.itemCode, im.itemName, im.specification,
           id.length, id.width, id.height, id.unit, id.quantity
    FROM itemmaster im
    LEFT JOIN itemdetails id ON im.itemId = id.itemId
  `
  db.query(query, (err, data) => {
    if (err) return res.status(500).json(new ApiError(500, 'Error retrieving inventory'))
    return res.status(200).json(new ApiResponse(200, data, 'Inventory retrieved successfully.'))
  })
})

// GET inventory item by ID
export const getInventoryItemById = asyncHandler(async (req, res) => {
  const { itemId } = req.params
  const query = `
    SELECT im.itemId, im.itemCode, im.itemName, im.specification,
           id.length, id.width, id.height, id.unit, id.quantity
    FROM itemmaster im
    LEFT JOIN itemdetails id ON im.itemId = id.itemId
    WHERE im.itemId = ?
  `
  db.query(query, [itemId], (err, data) => {
    if (err) return res.status(500).json(new ApiError(500, 'Error retrieving item'))
    if (data.length === 0) return res.status(404).json(new ApiError(404, 'Item not found'))
    return res.status(200).json(new ApiResponse(200, data[0], 'Item retrieved successfully.'))
  })
})

// CREATE inventory item
export const createInventoryItem = asyncHandler(async (req, res) => {
  const { itemCode, itemName, specification, length, width, height, unit, quantity } = req.body

  const insertMaster = `INSERT INTO itemmaster (itemCode, itemName, specification) VALUES (?, ?, ?)`
  db.query(insertMaster, [itemCode, itemName, specification], (err, result) => {
    if (err) return res.status(500).json(new ApiError(500, 'Error inserting item master'))

    const itemId = result.insertId
    const insertDetails = `
      INSERT INTO itemdetails (itemId, length, width, height, unit, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    db.query(insertDetails, [itemId, length, width, height, unit, quantity], (err2) => {
      if (err2) return res.status(500).json(new ApiError(500, 'Error inserting item details'))
      return res.status(201).json(new ApiResponse(201, null, 'Item created successfully.'))
    })
  })
})

// UPDATE inventory item
export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params
  const { itemCode, itemName, specification, length, width, height, unit, quantity } = req.body

  const updateMaster = `
    UPDATE itemmaster SET itemCode = ?, itemName = ?, specification = ?
    WHERE itemId = ?
  `
  db.query(updateMaster, [itemCode, itemName, specification, itemId], (err) => {
    if (err) return res.status(500).json(new ApiError(500, 'Error updating item master'))

    const updateDetails = `
      UPDATE itemdetails SET length = ?, width = ?, height = ?, unit = ?, quantity = ?
      WHERE itemId = ?
    `
    db.query(updateDetails, [length, width, height, unit, quantity, itemId], (err2) => {
      if (err2) return res.status(500).json(new ApiError(500, 'Error updating item details'))
      return res.status(200).json(new ApiResponse(200, null, 'Item updated successfully.'))
    })
  })
})

// DELETE inventory item
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params

  const deleteDetails = `DELETE FROM itemdetails WHERE itemId = ?`
  db.query(deleteDetails, [itemId], (err) => {
    if (err) return res.status(500).json(new ApiError(500, 'Error deleting item details'))

    const deleteMaster = `DELETE FROM itemmaster WHERE itemId = ?`
    db.query(deleteMaster, [itemId], (err2) => {
      if (err2) return res.status(500).json(new ApiError(500, 'Error deleting item master'))
      return res.status(200).json(new ApiResponse(200, null, 'Item deleted successfully.'))
    })
  })
})
