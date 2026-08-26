import asyncHandler from '../utils/asyncHandler.js'

/**
 * Middleware to check if user has permission to access/edit a specific stage
 * @param {string} operation - Either 'read' or 'edit'
 * @returns {Function} Express middleware function
 */
export const checkStageAccess = (operation = 'read') => asyncHandler(async (req, res, next) => {
  // Handle both :stageId and :id parameter names
  const stageId = req.params.stageId || req.params.id
  const { rbac } = req
  
  // Manager has full access
  if (rbac.isManager) {
    return next()
  }
  
  // Check edit permission
  if (operation === 'edit' && !rbac.ownedStages.includes(parseInt(stageId))) {
    return res.status(403).json({
      message: 'You do not have permission to edit this stage'
    })
  }
  
  // Check read permission
  if (operation === 'read' && !rbac.ownedStages.includes(parseInt(stageId))) {
    return res.status(403).json({
      message: 'You do not have permission to view this stage'
    })
  }
  
  next()
})
