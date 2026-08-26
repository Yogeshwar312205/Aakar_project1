/**
 * RBAC Utilities for Project Management
 * 
 * This module provides utility functions for handling role-based access control
 * in the frontend. These functions work with the canEdit flags provided by the
 * backend API responses.
 */

/**
 * Check if user can mark a stage as complete
 * 
 * @param {Object} stage - Stage object from API response
 * @param {boolean} stage.canMarkComplete - Permission flag from backend
 * @returns {boolean} - True if user can mark the stage as complete
 */
export const canMarkStageComplete = (stage) => {
  if (!stage) return false;
  
  // Backend provides canMarkComplete flag based on direct ownership
  return stage.canMarkComplete === true;
};

/**
 * Check if user can mark a substage as complete
 * 
 * @param {Object} substage - Substage object from API response
 * @param {boolean} substage.canMarkComplete - Permission flag from backend
 * @returns {boolean} - True if user can mark the substage as complete
 */
export const canMarkSubstageComplete = (substage) => {
  if (!substage) return false;
  
  // Backend provides canMarkComplete flag based on direct ownership
  return substage.canMarkComplete === true;
};

/**
 * Check if user can edit a stage
 * 
 * @param {Object} stage - Stage object from API response
 * @param {boolean} stage.canEdit - Permission flag from backend
 * @returns {boolean} - True if user can edit the stage
 */
export const canEditStage = (stage) => {
  if (!stage) return false;
  
  // Backend provides canEdit flag based on Manager role or stage ownership
  return stage.canEdit === true;
};

/**
 * Check if user can edit a substage
 * 
 * @param {Object} substage - Substage object from API response
 * @param {boolean} substage.canEdit - Permission flag from backend
 * @returns {boolean} - True if user can edit the substage
 */
export const canEditSubstage = (substage) => {
  if (!substage) return false;
  
  // Backend provides canEdit flag based on Manager role, substage ownership, or parent stage ownership
  return substage.canEdit === true;
};

/**
 * Check if user can access BOM data
 * 
 * @param {Object} bomItem - BOM item object from API response
 * @param {boolean} bomItem.canEdit - Permission flag from backend
 * @returns {boolean} - True if user can access/edit the BOM item
 */
export const canAccessBOM = (bomItem) => {
  if (!bomItem) return false;
  
  // Backend provides canEdit flag - only Stage_Owners (not Substage_Owners) can access BOMs
  return bomItem.canEdit === true;
};

/**
 * Extract role information from user context or API response
 * 
 * @param {Object} user - User object from context or auth
 * @param {Object} projectData - Optional project data with role info
 * @returns {Object} - Role information object
 */
export const extractRoleInfo = (user, projectData = null) => {
  if (!user) {
    return {
      isManager: false,
      isStageOwner: false,
      isSubstageOwner: false,
      role: 'none'
    };
  }
  
  // If projectData is provided with RBAC context
  if (projectData && projectData.rbac) {
    return {
      isManager: projectData.rbac.isManager === true,
      isStageOwner: projectData.rbac.ownedStages && projectData.rbac.ownedStages.length > 0,
      isSubstageOwner: projectData.rbac.ownedSubstages && projectData.rbac.ownedSubstages.length > 0,
      role: projectData.rbac.role || 'none',
      ownedStages: projectData.rbac.ownedStages || [],
      ownedSubstages: projectData.rbac.ownedSubstages || []
    };
  }
  
  // Default: extract from user object if available
  return {
    isManager: user.isManager === true || user.role === 'manager',
    isStageOwner: user.ownedStages && user.ownedStages.length > 0,
    isSubstageOwner: user.ownedSubstages && user.ownedSubstages.length > 0,
    role: user.role || 'none',
    ownedStages: user.ownedStages || [],
    ownedSubstages: user.ownedSubstages || []
  };
};

/**
 * Check if user is a Manager for a specific project
 * 
 * @param {Object} user - User object from context
 * @param {string|number} projectNumber - Project number to check
 * @param {string|number} projectCreatedBy - Employee ID of project creator
 * @returns {boolean} - True if user is the project manager
 */
export const isProjectManager = (user, projectNumber, projectCreatedBy) => {
  if (!user || !projectCreatedBy) return false;
  
  // Check if user is the project creator
  return user.employeeId === projectCreatedBy || user.employeeId === parseInt(projectCreatedBy);
};

/**
 * Get user's accessible stages from a list of stages
 * 
 * @param {Array} stages - Array of stage objects from API
 * @returns {Array} - Filtered array of stages user can access
 */
export const getAccessibleStages = (stages) => {
  if (!Array.isArray(stages)) return [];
  
  // Backend already filters stages - this is for additional frontend filtering if needed
  // Return all stages since backend handles filtering
  return stages;
};

/**
 * Get user's accessible substages from a list of substages
 * 
 * @param {Array} substages - Array of substage objects from API
 * @returns {Array} - Filtered array of substages user can access
 */
export const getAccessibleSubstages = (substages) => {
  if (!Array.isArray(substages)) return [];
  
  // Backend already filters substages - this is for additional frontend filtering if needed
  // Return all substages since backend handles filtering
  return substages;
};

/**
 * Get user's editable stages from a list of stages
 * 
 * @param {Array} stages - Array of stage objects from API
 * @returns {Array} - Filtered array of stages user can edit
 */
export const getEditableStages = (stages) => {
  if (!Array.isArray(stages)) return [];
  
  return stages.filter(stage => canEditStage(stage));
};

/**
 * Get user's editable substages from a list of substages
 * 
 * @param {Array} substages - Array of substage objects from API
 * @returns {Array} - Filtered array of substages user can edit
 */
export const getEditableSubstages = (substages) => {
  if (!Array.isArray(substages)) return [];
  
  return substages.filter(substage => canEditSubstage(substage));
};

/**
 * Get user's accessible BOM items from a list
 * 
 * @param {Array} bomItems - Array of BOM item objects from API
 * @returns {Array} - Filtered array of BOM items user can access
 */
export const getAccessibleBOMItems = (bomItems) => {
  if (!Array.isArray(bomItems)) return [];
  
  // Backend already filters BOMs - return all since backend handles filtering
  return bomItems;
};

/**
 * Get user's editable BOM items from a list
 * 
 * @param {Array} bomItems - Array of BOM item objects from API
 * @returns {Array} - Filtered array of BOM items user can edit
 */
export const getEditableBOMItems = (bomItems) => {
  if (!Array.isArray(bomItems)) return [];
  
  return bomItems.filter(bomItem => canAccessBOM(bomItem));
};

/**
 * Check if user has any stage assignments
 * 
 * @param {Object} roleInfo - Role info from extractRoleInfo
 * @returns {boolean} - True if user has at least one stage assignment
 */
export const hasStageAssignments = (roleInfo) => {
  if (!roleInfo) return false;
  
  return roleInfo.isStageOwner === true || 
         (roleInfo.ownedStages && roleInfo.ownedStages.length > 0);
};

/**
 * Check if user has any substage assignments
 * 
 * @param {Object} roleInfo - Role info from extractRoleInfo
 * @returns {boolean} - True if user has at least one substage assignment
 */
export const hasSubstageAssignments = (roleInfo) => {
  if (!roleInfo) return false;
  
  return roleInfo.isSubstageOwner === true || 
         (roleInfo.ownedSubstages && roleInfo.ownedSubstages.length > 0);
};

/**
 * Check if user has any project access (Manager or any assignments)
 * 
 * @param {Object} roleInfo - Role info from extractRoleInfo
 * @returns {boolean} - True if user has any access to the project
 */
export const hasProjectAccess = (roleInfo) => {
  if (!roleInfo) return false;
  
  return roleInfo.isManager === true || 
         hasStageAssignments(roleInfo) || 
         hasSubstageAssignments(roleInfo);
};

/**
 * Get role display name for UI
 * 
 * @param {Object} roleInfo - Role info from extractRoleInfo
 * @returns {string} - User-friendly role name
 */
export const getRoleDisplayName = (roleInfo) => {
  if (!roleInfo) return 'No Access';
  
  if (roleInfo.isManager) return 'Manager';
  if (roleInfo.isStageOwner && roleInfo.isSubstageOwner) return 'Stage & Substage Owner';
  if (roleInfo.isStageOwner) return 'Stage Owner';
  if (roleInfo.isSubstageOwner) return 'Substage Owner';
  
  return 'No Access';
};

/**
 * Check if an item is read-only for the user
 * 
 * @param {Object} item - Item object (stage, substage, or BOM) from API
 * @returns {boolean} - True if item is read-only
 */
export const isReadOnly = (item) => {
  if (!item) return true;
  
  return item.canEdit !== true;
};

/**
 * Get permission badge text for UI display
 * 
 * @param {Object} item - Item object (stage, substage, or BOM) from API
 * @returns {string} - Badge text ('Editable' or 'Read Only')
 */
export const getPermissionBadge = (item) => {
  return isReadOnly(item) ? 'Read Only' : 'Editable';
};

/**
 * Default export object with all utility functions
 */
export default {
  canEditStage,
  canEditSubstage,
  canAccessBOM,
  canMarkStageComplete,
  canMarkSubstageComplete,
  extractRoleInfo,
  isProjectManager,
  getAccessibleStages,
  getAccessibleSubstages,
  getEditableStages,
  getEditableSubstages,
  getAccessibleBOMItems,
  getEditableBOMItems,
  hasStageAssignments,
  hasSubstageAssignments,
  hasProjectAccess,
  getRoleDisplayName,
  isReadOnly,
  getPermissionBadge
};
