-- Migration: Recursive Substages + Stage Templates
-- Date: 2026-02-27


-- Feature 1: Recursive Substages
-- Add parentSubstageId to substage table


ALTER TABLE `substage`
  ADD COLUMN `parentSubstageId` INT(11) DEFAULT NULL AFTER `stageId`;

ALTER TABLE `substage`
  ADD KEY `substage_parent_fk` (`parentSubstageId`);

-- =============================================
-- Feature 2: Stage Templates
-- =============================================

CREATE TABLE IF NOT EXISTS `stage_template` (
  `templateId` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateName` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `createdBy` INT(10) UNSIGNED DEFAULT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`templateId`),
  KEY `template_createdBy_fk` (`createdBy`),
  CONSTRAINT `template_createdBy_fk` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `stage_template_item` (
  `itemId` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateId` INT(10) UNSIGNED NOT NULL,
  `stageName` VARCHAR(255) NOT NULL,
  `machine` VARCHAR(255) DEFAULT NULL,
  `duration` INT(11) DEFAULT NULL,
  `orderIndex` INT(11) NOT NULL DEFAULT 0,
  `parentItemId` INT(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`itemId`),
  KEY `templateItem_template_fk` (`templateId`),
  KEY `templateItem_parent_fk` (`parentItemId`),
  CONSTRAINT `templateItem_template_fk` FOREIGN KEY (`templateId`) REFERENCES `stage_template` (`templateId`) ON DELETE CASCADE,
  CONSTRAINT `templateItem_parent_fk` FOREIGN KEY (`parentItemId`) REFERENCES `stage_template_item` (`itemId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
