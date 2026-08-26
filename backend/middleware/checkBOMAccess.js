import asyncHandler from '../utils/asyncHandler.js'

/**
 * Middleware to check if user has permission to access BOM data
 * BOM access requires Stage ownership (not Substage ownership)
 * Only Managers and Stage_Owners can access BOM data
 * 
 * @returns {Function} Express middleware function
 */
export const checkBOMAccess = asyncHandler(async (req, res, next) => {
  const { stageId } = req.params
  const { rbac } = req
  
  // Manager has full access
  if (rbac.isManager) {
    return next()
  }
  
  // BOM access requires Stage ownership, not substage ownership
  if (!rbac.ownedStages.includes(parseInt(stageId))) {
    return res.status(403).json({
      message: 'Only stage owners can access BOM data'
    })
  }
  
  next()
})
