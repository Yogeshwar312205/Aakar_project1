-- Migration: Create stage_assignment table for RBAC
-- Date: 2025-02-04
-- Purpose: Enable role-based access control by tracking stage and substage assignments to employees

CREATE TABLE IF NOT EXISTS `stage_assignment` (
  `assignmentId` INT(11) NOT NULL AUTO_INCREMENT,
  `projectNumber` INT(11) NOT NULL,
  `stageId` INT(11) DEFAULT NULL,
  `substageId` INT(11) DEFAULT NULL,
  `employeeId` INT(10) UNSIGNED NOT NULL,
  `assignedBy` INT(10) UNSIGNED NOT NULL,
  `assignedDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`assignmentId`),
  
  -- Foreign key constraints with cascading deletes
  CONSTRAINT `stage_assignment_stage_fk` 
    FOREIGN KEY (`stageId`) 
    REFERENCES `stage` (`stageId`) 
    ON DELETE CASCADE,
  
  CONSTRAINT `stage_assignment_substage_fk` 
    FOREIGN KEY (`substageId`) 
    REFERENCES `substage` (`substageId`) 
    ON DELETE CASCADE,
  
  CONSTRAINT `stage_assignment_employee_fk` 
    FOREIGN KEY (`employeeId`) 
    REFERENCES `employee` (`employeeId`) 
    ON DELETE CASCADE,
  
  CONSTRAINT `stage_assignment_assignedBy_fk` 
    FOREIGN KEY (`assignedBy`) 
    REFERENCES `employee` (`employeeId`),
  
  -- CHECK constraint: exactly one of stageId or substageId must be set
  CONSTRAINT `chk_single_assignment` 
    CHECK (
      (stageId IS NOT NULL AND substageId IS NULL) OR 
      (stageId IS NULL AND substageId IS NOT NULL)
    ),
  
  -- Indexes for query performance
  INDEX `idx_project` (`projectNumber`),
  INDEX `idx_employee` (`employeeId`),
  INDEX `idx_stage` (`stageId`),
  INDEX `idx_substage` (`substageId`),
  
  -- Composite index for common queries
  INDEX `idx_employee_project` (`employeeId`, `projectNumber`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
