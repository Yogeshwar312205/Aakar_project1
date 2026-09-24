-- ============================================
-- Migration: Add External Trainer Support
-- Date: 2025-02-04
-- Purpose: Add fields to support external trainers with time-based access control
-- ============================================

START TRANSACTION;

-- Add userType column to differentiate between internal employees and external trainers
ALTER TABLE `employee` 
ADD COLUMN `userType` ENUM('internal', 'external_trainer') NOT NULL DEFAULT 'internal' AFTER `employeeAccess`,
ADD COLUMN `accessStartDate` DATE NULL AFTER `userType`,
ADD COLUMN `accessEndDate` DATE NULL AFTER `accessStartDate`,
ADD COLUMN `canManageExternalTrainers` BOOLEAN NOT NULL DEFAULT FALSE AFTER `accessEndDate`;

-- Add indexes for better query performance
ALTER TABLE `employee`
ADD INDEX `idx_userType` (`userType`),
ADD INDEX `idx_access_dates` (`accessStartDate`, `accessEndDate`),
ADD INDEX `idx_canManageExternalTrainers` (`canManageExternalTrainers`);

-- Verification: Check the new columns
SELECT 
    'Migration completed successfully. New columns added:' as status,
    COUNT(*) as total_employees,
    SUM(CASE WHEN userType = 'internal' THEN 1 ELSE 0 END) as internal_employees,
    SUM(CASE WHEN userType = 'external_trainer' THEN 1 ELSE 0 END) as external_trainers,
    SUM(CASE WHEN canManageExternalTrainers = TRUE THEN 1 ELSE 0 END) as can_manage_external_trainers
FROM employee;

COMMIT;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- START TRANSACTION;
-- ALTER TABLE `employee`
-- DROP INDEX `idx_canManageExternalTrainers`,
-- DROP INDEX `idx_access_dates`,
-- DROP INDEX `idx_userType`,
-- DROP COLUMN `canManageExternalTrainers`,
-- DROP COLUMN `accessEndDate`,
-- DROP COLUMN `accessStartDate`,
-- DROP COLUMN `userType`;
-- COMMIT;
-- ============================================
