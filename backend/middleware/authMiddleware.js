import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'
import { connection } from '../db/index.js'

export const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization'?.replace('Bearer ', ''))
    // console.log(token)
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized Request' })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    const [user] = await connection
      .promise()
      .query('SELECT * FROM employee WHERE customEmployeeId = ?', [
        decoded.customEmployeeId,
      ])

    if (!user) {
      return res.status(401).json({ message: 'Invalid Access Token' })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: error?.message })
  }
})
