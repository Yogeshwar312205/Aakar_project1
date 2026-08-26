-- Migration: Populate stage_assignment table for backward compatibility
-- Date: 2025-02-04
-- Purpose: Migrate existing projects to RBAC by assigning all stages and substages to project creators (Managers)
--          This ensures existing projects continue functioning after RBAC deployment
-- Idempotent: Safe to run multiple times without creating duplicate assignments

-- =============================================================================
-- BACKWARD COMPATIBILITY MIGRATION
-- =============================================================================
-- This script implements Requirement 19: Backward Compatibility with Existing Projects
-- It automatically grants Manager role access by creating stage_assignment records
-- for all project creators, ensuring no disruption to current users.
-- =============================================================================

START TRANSACTION;

-- Step 1: Assign all active stages to their respective project creators (Managers)
-- Only process active stages (historyOf IS NULL) to avoid assigning archived versions
INSERT IGNORE INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy, assignedDate)
SELECT DISTINCT 
    s.projectNumber, 
    s.stageId,
    NULL AS substageId,
    p.projectCreatedBy AS employeeId,
    p.projectCreatedBy AS assignedBy,
    NOW() AS assignedDate
FROM stage s
INNER JOIN project p ON s.projectNumber = p.projectNumber
WHERE s.historyOf IS NULL
  AND p.projectCreatedBy IS NOT NULL;

-- Log stage assignment results
SELECT 
    COUNT(*) as stage_assignments_created,
    COUNT(DISTINCT projectNumber) as projects_with_stage_assignments,
    COUNT(DISTINCT employeeId) as managers_assigned_to_stages
FROM stage_assignment
WHERE stageId IS NOT NULL;

-- Step 2: Assign all active substages to their respective project creators (Managers)
-- Only process active substages (historyOf IS NULL) to avoid assigning archived versions
INSERT IGNORE INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy, assignedDate)
SELECT DISTINCT 
    ss.projectNumber, 
    NULL AS stageId,
    ss.substageId,
    p.projectCreatedBy AS employeeId,
    p.projectCreatedBy AS assignedBy,
    NOW() AS assignedDate
FROM substage ss
INNER JOIN project p ON ss.projectNumber = p.projectNumber
WHERE ss.historyOf IS NULL
  AND p.projectCreatedBy IS NOT NULL;

-- Log substage assignment results
SELECT 
    COUNT(*) as substage_assignments_created,
    COUNT(DISTINCT projectNumber) as projects_with_substage_assignments,
    COUNT(DISTINCT employeeId) as managers_assigned_to_substages
FROM stage_assignment
WHERE substageId IS NOT NULL;

-- Step 3: Generate comprehensive migration summary
SELECT 
    COUNT(*) as total_assignments_in_table,
    COUNT(DISTINCT employeeId) as unique_employees_with_assignments,
    COUNT(DISTINCT projectNumber) as unique_projects_with_assignments,
    SUM(CASE WHEN stageId IS NOT NULL THEN 1 ELSE 0 END) as total_stage_assignments,
    SUM(CASE WHEN substageId IS NOT NULL THEN 1 ELSE 0 END) as total_substage_assignments
FROM stage_assignment;

-- Verify data integrity: Check for any violations of the single assignment constraint
-- This should return 0 rows if the migration succeeded correctly
SELECT 
    assignmentId,
    projectNumber,
    stageId,
    substageId,
    employeeId
FROM stage_assignment
WHERE (stageId IS NOT NULL AND substageId IS NOT NULL) 
   OR (stageId IS NULL AND substageId IS NULL)
LIMIT 10;

COMMIT;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- All project creators (Managers) have been assigned to their project's stages
-- and substages, maintaining backward compatibility with the existing system.
-- Managers now have explicit ownership records in the stage_assignment table.
-- =============================================================================
