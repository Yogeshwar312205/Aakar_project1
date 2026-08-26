import asyncHandler from '../utils/asyncHandler.js'
import { connection } from '../db/index.js'

/**
 * Middleware to check if user has permission to access/edit a substage
 * @param {string} operation - 'read' or 'edit'
 * @returns {Function} Express middleware function
 */
export const checkSubstageAccess = (operation = 'read') => asyncHandler(async (req, res, next) => {
  const { substageId } = req.params
  const { rbac } = req

  // Manager has full access to all substages
  if (rbac.isManager) {
    return next()
  }

  // For 'edit' operation, check if user owns the substage
  if (operation === 'edit') {
    // First check if user directly owns this substage
    const directlyOwned = rbac.ownedSubstages.includes(parseInt(substageId))
    
    if (directlyOwned) {
      return next()
    }

    // If not directly owned, query to get parent stageId
    const [substage] = await connection.promise().query(
      'SELECT stageId FROM substage WHERE substageId = ?',
      [substageId]
    )

    // Check if substage exists
    if (!substage || substage.length === 0) {
      return res.status(404).json({
        message: 'Substage not found'
      })
    }

    // Check if user owns the parent stage
    const ownsParentStage = rbac.ownedStages.includes(substage[0].stageId)
    
    if (!ownsParentStage) {
      return res.status(403).json({
        message: 'You do not have permission to edit this substage'
      })
    }
  }

  // If all checks pass, allow access
  next()
})
