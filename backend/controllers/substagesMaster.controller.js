import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

export const getAllSubstagesMaster = asyncHandler(async (req, res) => {
  const query = 'SELECT id, name FROM substages ORDER BY id DESC'
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(new ApiError(500, 'Failed to fetch substages'))
    }
    return res.status(200).json(results)
  })
})

export const createSubstageMaster = asyncHandler(async (req, res) => {
  const { name } = req.body || {}
  if (!name || !name.trim()) {
    return res.status(400).json(new ApiError(400, 'name is required'))
  }
  const insert = 'INSERT INTO substages (name) VALUES (?)'
  db.query(insert, [name.trim()], (err, result) => {
    if (err) {
      return res.status(500).json(new ApiError(500, 'Failed to create substage'))
    }
    return res
      .status(201)
      .json({ id: result.insertId, name: name.trim() })
  })
})

export const deleteSubstageMaster = asyncHandler(async (req, res) => {
  const { id } = req.params
  const del = 'DELETE FROM substages WHERE id = ?'
  db.query(del, [id], (err, result) => {
    if (err) {
      return res.status(500).json(new ApiError(500, 'Failed to delete substage'))
    }
    if (result.affectedRows === 0) {
      return res.status(404).json(new ApiError(404, 'Substage not found'))
    }
    return res.status(200).json({ id: Number(id) })
  })
})

export const updateSubstageMaster = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name } = req.body || {}
  if (!name || !name.trim()) {
    return res.status(400).json(new ApiError(400, 'name is required'))
  }
  const upd = 'UPDATE substages SET name = ? WHERE id = ?'
  db.query(upd, [name.trim(), id], (err, result) => {
    if (err) {
      return res.status(500).json(new ApiError(500, 'Failed to update substage'))
    }
    if (result.affectedRows === 0) {
      return res.status(404).json(new ApiError(404, 'Substage not found'))
    }
    return res.status(200).json({ id: Number(id), name: name.trim() })
  })
})


