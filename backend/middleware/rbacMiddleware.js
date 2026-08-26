import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import { connection } from '../db/index.js'

/**
 * RBAC Middleware - Role-Based Access Control for Project Management
 * 
 * This middleware detects user role and attaches authorization context to the request object.
 * It determines if the user is a Manager (project creator) or an Assignee (stage/substage owner).
 * 
 * Input: 
 *   - req.user[0].employeeId (from authMiddleware)
 *   - req.params.projectNumber or req.body.projectNumber
 * 
 * Output: 
 *   - req.rbac = {
 *       role: 'manager' | 'assignee',
 *       ownedStages: [stageId, ...],
 *       ownedSubstages: [substageId, ...],
 *       isManager: boolean
 *     }
 * 
 * Error Cases:
 *   - Returns 403 if user has no project access (not manager and no stage assignments)
 */
export const rbacMiddleware = asyncHandler(async (req, res, next) => {
  // Extract employeeId from req.user (set by authMiddleware)
  const employeeId = req.user[0]?.employeeId
  
  if (!employeeId) {
    throw new ApiError(401, 'User authentication required')
  }
  
  // Extract projectNumber from request params or body
  // First try explicit projectNumber param
  let projectNumber = req.params.projectNumber || req.body.projectNumber
  
  // If not found, req.params.id might be a projectNumber, stageId, or substageId - resolve it
  if (!projectNumber && req.params.id) {
    // Try to look it up in this order: stage -> substage -> project
    // This order is intentional because routes like /activeSubStages/:stageId use stageId most commonly
    
    // First check if it's a stageId
    const [stageData] = await connection.promise().query(
      'SELECT projectNumber FROM stage WHERE stageId = ?',
      [req.params.id]
    )
    
    if (stageData && stageData.length > 0) {
      projectNumber = stageData[0].projectNumber
      console.log('[RBAC] Resolved stageId', req.params.id, 'to projectNumber', projectNumber)
    } else {
      // Not a stageId, check if it's a substageId
      const [substageData] = await connection.promise().query(
        'SELECT projectNumber FROM substage WHERE substageId = ?',
        [req.params.id]
      )
      
      if (substageData && substageData.length > 0) {
        projectNumber = substageData[0].projectNumber
        console.log('[RBAC] Resolved substageId', req.params.id, 'to projectNumber', projectNumber)
      } else {
        // Not a substageId, assume it's a projectNumber directly
        projectNumber = req.params.id
        console.log('[RBAC] Using req.params.id as projectNumber:', projectNumber)
      }
    }
  }
  
  if (!projectNumber) {
    throw new ApiError(400, 'Project number is required')
  }
  
  console.log('[RBAC] Checking access for:', { employeeId, projectNumber })
  
  // Step 1: Check if user is the project creator (Manager role)
  const [projectData] = await connection.promise().query(
    'SELECT projectCreatedBy FROM project WHERE projectNumber = ?',
    [projectNumber]
  )
  
  if (!projectData || projectData.length === 0) {
    throw new ApiError(404, 'Project not found')
  }
  
  console.log('[RBAC] Project creator:', projectData[0].projectCreatedBy, 'Current user:', employeeId)
  
  console.log('[RBAC] ========== RBAC MIDDLEWARE DEBUG ==========')
  console.log('[RBAC] User ID:', employeeId)
  console.log('[RBAC] Project Number:', projectNumber)
  console.log('[RBAC] Project Creator:', projectData[0]?.projectCreatedBy)
  console.log('[RBAC] Project Creator Type:', typeof projectData[0]?.projectCreatedBy)
  console.log('[RBAC] User ID Type:', typeof employeeId)
  console.log('[RBAC] Is Manager?:', projectData[0]?.projectCreatedBy === employeeId)
  console.log('[RBAC] Strict Match:', projectData[0]?.projectCreatedBy, '===', employeeId, '?', projectData[0]?.projectCreatedBy === employeeId)
  console.log('[RBAC] ==============================================')
  
  // If user is project creator, grant Manager role with full access
  if (projectData[0].projectCreatedBy === employeeId) {
    console.log('[RBAC] User is Manager (project creator)')
    req.rbac = {
      role: 'manager',
      ownedStages: [], // Empty because manager has access to all
      ownedSubstages: [], // Empty because manager has access to all
      isManager: true,
      projectNumber: projectNumber
    }
    return next()
  }
  
  // Step 2: User is not Manager - check stage_assignment table for owned stages/substages
  const [assignments] = await connection.promise().query(
    'SELECT stageId, substageId FROM stage_assignment WHERE employeeId = ? AND projectNumber = ?',
    [employeeId, projectNumber]
  )
  
  console.log('[RBAC] Assignments found:', assignments.length)
  
  // If no assignments found, deny access
  if (!assignments || assignments.length === 0) {
    console.log('[RBAC] No assignments found - Access denied')
    throw new ApiError(403, 'You do not have permission to access this project')
  }
  
  // Extract owned stageIds and substageIds from assignments
  const ownedStages = assignments
    .filter(a => a.stageId !== null)
    .map(a => a.stageId)
  
  const ownedSubstages = assignments
    .filter(a => a.substageId !== null)
    .map(a => a.substageId)
  
  console.log('[RBAC] User is Assignee - Owned stages:', ownedStages, 'Owned substages:', ownedSubstages)
  
  // Attach RBAC context to request
  req.rbac = {
    role: 'assignee',
    ownedStages: ownedStages,
    ownedSubstages: ownedSubstages,
    isManager: false,
    projectNumber: projectNumber
  }
  
  next()
})
