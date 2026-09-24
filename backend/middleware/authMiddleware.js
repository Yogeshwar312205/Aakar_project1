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
    
    // Check if user is an external trainer and validate access period
    if (user[0].userType === 'external_trainer') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const accessStartDate = user[0].accessStartDate ? new Date(user[0].accessStartDate) : null;
      const accessEndDate = user[0].accessEndDate ? new Date(user[0].accessEndDate) : null;
      
      if (accessStartDate) {
        accessStartDate.setHours(0, 0, 0, 0);
      }
      
      if (accessEndDate) {
        accessEndDate.setHours(23, 59, 59, 999);
      }
      
      // Check if access period is valid
      if (!accessStartDate || !accessEndDate) {
        console.log('[Auth] External trainer missing access dates:', user[0].customEmployeeId);
        return res.status(403).json({ 
          message: 'Your account is not properly configured. Please contact HR.',
          code: 'MISSING_ACCESS_DATES'
        });
      }
      
      // Check if access has not started yet
      if (today < accessStartDate) {
        console.log('[Auth] External trainer access not started:', user[0].customEmployeeId, 
                    '| Start:', accessStartDate.toLocaleDateString());
        return res.status(403).json({ 
          message: `Your access period has not started yet. Access begins on ${accessStartDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          code: 'ACCESS_NOT_STARTED',
          accessStartDate: user[0].accessStartDate
        });
      }
      
      // Check if access has expired
      if (today > accessEndDate) {
        console.log('[Auth] External trainer access expired:', user[0].customEmployeeId, 
                    '| End:', accessEndDate.toLocaleDateString());
        return res.status(403).json({ 
          message: `Your access period has ended on ${accessEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Please contact HR if you need extended access.`,
          code: 'ACCESS_EXPIRED',
          accessEndDate: user[0].accessEndDate
        });
      }
      
      console.log('[Auth] ✅ External trainer access valid:', user[0].customEmployeeId, 
                  '| Period:', accessStartDate.toLocaleDateString(), '-', accessEndDate.toLocaleDateString());
    }
    
    req.user = user
    next()
  } catch (error) {
    console.log(`Error: ${error?.message}`)
    return res.status(401).json({ message: error?.message })
  }
})
