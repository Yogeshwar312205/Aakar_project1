import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { connection } from '../db/index.js';

/**
 * Middleware to check if the authenticated user has permission to manage external trainers
 * Only users with canManageExternalTrainers = TRUE can access external trainer management routes
 * 
 * Prerequisites: authMiddleware must run before this middleware
 * 
 * @throws {ApiError} 401 - If user is not authenticated
 * @throws {ApiError} 404 - If employee record not found
 * @throws {ApiError} 403 - If user lacks permission to manage external trainers
 */
export const checkExternalTrainerAccess = asyncHandler(async (req, res, next) => {
  // Extract employeeId from req.user (set by authMiddleware)
  const employeeId = req.user[0]?.employeeId;
  
  if (!employeeId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  console.log('[External Trainer Access Check] Employee ID:', employeeId);
  
  // Check if employee has permission to manage external trainers
  const [employee] = await connection.promise().query(
    'SELECT canManageExternalTrainers, employeeName, userType FROM employee WHERE employeeId = ?',
    [employeeId]
  );
  
  if (!employee || employee.length === 0) {
    throw new ApiError(404, 'Employee not found');
  }
  
  const employeeData = employee[0];
  
  console.log('[External Trainer Access Check] Employee:', employeeData.employeeName, 
              '| Can Manage:', employeeData.canManageExternalTrainers);
  
  // External trainers cannot manage other external trainers
  if (employeeData.userType === 'external_trainer') {
    throw new ApiError(403, 'External trainers cannot manage other external trainers');
  }
  
  // Check permission
  if (!employeeData.canManageExternalTrainers) {
    throw new ApiError(403, 'You do not have permission to manage external trainers. Please contact your administrator.');
  }
  
  console.log('[External Trainer Access Check] ✅ Access granted');
  
  // Attach employee info to request for audit logging
  req.managingEmployee = {
    employeeId,
    employeeName: employeeData.employeeName
  };
  
  next();
});
