-- ============================================
-- Aakar ERP — Merged Database Schema
-- Combines ALL tables from both repos:
--   - HR/Employee/Department/Designation
--   - Project Management (project, stage, substage)
--   - Training Management
--   - Ticket Tracking
--   - BOM / Inventory
--   - Stage Templates
--   - Transactions
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `aakar`;
USE `aakar`;

-- ============================================
-- 1. CORE TABLES (HR Section)
-- ============================================

-- Department
CREATE TABLE IF NOT EXISTS `department` (
  `departmentId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `departmentName` varchar(50) NOT NULL,
  `departmentSlug` varchar(50) NOT NULL DEFAULT '',
  `departmentStartDate` date DEFAULT NULL,
  `departmentEndDate` date DEFAULT NULL,
  PRIMARY KEY (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Designation
CREATE TABLE IF NOT EXISTS `designation` (
  `designationId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `designationName` varchar(50) NOT NULL,
  `designationSlug` varchar(50) NOT NULL DEFAULT '',
  `access` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`designationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Employee
CREATE TABLE IF NOT EXISTS `employee` (
  `employeeId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `customEmployeeId` varchar(50) NOT NULL,
  `employeeName` varchar(100) NOT NULL,
  `companyName` varchar(100) NOT NULL,
  `employeeQualification` varchar(100) DEFAULT NULL,
  `experienceInYears` int(11) DEFAULT NULL,
  `employeeDOB` date DEFAULT NULL,
  `employeeJoinDate` date DEFAULT NULL,
  `employeeGender` enum('Male','Female','Other') NOT NULL,
  `employeePhone` varchar(20) DEFAULT NULL,
  `employeeEmail` varchar(100) DEFAULT NULL,
  `employeePassword` varchar(255) NOT NULL,
  `employeeAccess` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `employeeRefreshToken` varchar(255) DEFAULT NULL,
  `employeeEndDate` date DEFAULT NULL,
  PRIMARY KEY (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Employee-Designation mapping
CREATE TABLE IF NOT EXISTS `employeedesignation` (
  `employeeDesignationId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employeeId` int(10) UNSIGNED DEFAULT NULL,
  `departmentId` tinyint(3) UNSIGNED DEFAULT NULL,
  `designationId` tinyint(3) UNSIGNED DEFAULT NULL,
  `managerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`employeeDesignationId`),
  KEY `employeeId` (`employeeId`),
  KEY `departmentId` (`departmentId`),
  KEY `designationId` (`designationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 2. SKILL / TRAINING TABLES
-- ============================================

-- Skill
CREATE TABLE IF NOT EXISTS `skill` (
  `skillId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `skillName` varchar(50) DEFAULT NULL,
  `departmentId` tinyint(3) UNSIGNED DEFAULT 0,
  `skillAddedBy` varchar(50) DEFAULT NULL,
  `departmentIdGivingTraining` tinyint(3) UNSIGNED DEFAULT 0,
  `skillDescription` varchar(200) DEFAULT NULL,
  `skillStartDate` date DEFAULT NULL,
  `skillEndDate` date DEFAULT NULL,
  `skillActivityStatus` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Department-Skill mapping
CREATE TABLE IF NOT EXISTS `departmentskill` (
  `skillId` tinyint(3) UNSIGNED NOT NULL,
  `departmentId` tinyint(3) UNSIGNED NOT NULL,
  `departmentSkillType` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `departmentSkillStatus` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`skillId`,`departmentId`,`departmentSkillType`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `fk_deptskill_skill` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`),
  CONSTRAINT `fk_deptskill_dept` FOREIGN KEY (`departmentId`) REFERENCES `department` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Employee-Skill mapping (Skill Matrix)
CREATE TABLE IF NOT EXISTS `employeeskill` (
  `employeeId` int(10) UNSIGNED NOT NULL,
  `skillId` tinyint(3) UNSIGNED NOT NULL,
  `grade` tinyint(3) UNSIGNED DEFAULT NULL,
  `skillTrainingResult` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`employeeId`,`skillId`),
  KEY `skillId` (`skillId`),
  CONSTRAINT `fk_empskill_emp` FOREIGN KEY (`employeeId`) REFERENCES `employee` (`employeeId`),
  CONSTRAINT `fk_empskill_skill` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Training
CREATE TABLE IF NOT EXISTS `training` (
  `trainingId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainerId` int(10) UNSIGNED DEFAULT NULL,
  `startTrainingDate` date DEFAULT NULL,
  `endTrainingDate` date DEFAULT NULL,
  `skillId` tinyint(3) UNSIGNED DEFAULT NULL,
  `trainingTitle` varchar(50) DEFAULT NULL,
  `evaluationType` int(11) DEFAULT NULL,
  PRIMARY KEY (`trainingId`),
  KEY `fk_training_skill` (`skillId`),
  CONSTRAINT `fk_training_skill` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Training-Skills mapping
CREATE TABLE IF NOT EXISTS `trainingskills` (
  `trainingId` int(10) UNSIGNED DEFAULT NULL,
  `skillId` tinyint(3) UNSIGNED DEFAULT NULL,
  KEY `fk_tskills_training` (`trainingId`),
  KEY `fk_tskills_skill` (`skillId`),
  CONSTRAINT `fk_tskills_training` FOREIGN KEY (`trainingId`) REFERENCES `training` (`trainingId`),
  CONSTRAINT `fk_tskills_skill` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Training Registration (employee enrolled in training)
CREATE TABLE IF NOT EXISTS `trainingregistration` (
  `employeeId` int(10) UNSIGNED NOT NULL,
  `trainingId` int(10) UNSIGNED NOT NULL,
  `trainerFeedback` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`employeeId`,`trainingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sessions (training sessions)
CREATE TABLE IF NOT EXISTS `sessions` (
  `sessionId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `sessionName` varchar(55) NOT NULL,
  `sessionDate` date DEFAULT NULL,
  `sessionStartTime` time DEFAULT NULL,
  `sessionEndTime` time DEFAULT NULL,
  `trainingId` int(10) UNSIGNED DEFAULT NULL,
  `sessionDescription` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`sessionId`),
  KEY `trainingId` (`trainingId`),
  CONSTRAINT `fk_sessions_training` FOREIGN KEY (`trainingId`) REFERENCES `training` (`trainingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Attendance
CREATE TABLE IF NOT EXISTS `attendance` (
  `employeeId` int(10) UNSIGNED DEFAULT NULL,
  `sessionId` tinyint(3) UNSIGNED DEFAULT NULL,
  `attendanceStatus` tinyint(1) DEFAULT NULL,
  UNIQUE KEY `employeeId` (`employeeId`,`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Assign Training (manager assignments)
CREATE TABLE IF NOT EXISTS `assigntraining` (
  `employeeId` int(10) UNSIGNED DEFAULT NULL,
  `employeeName` varchar(50) NOT NULL,
  `skillName` varchar(50) DEFAULT NULL,
  `skillId` tinyint(3) UNSIGNED DEFAULT NULL,
  `grade` tinyint(3) UNSIGNED DEFAULT NULL,
  KEY `skillId` (`skillId`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `fk_assignt_skill` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`),
  CONSTRAINT `fk_assignt_emp` FOREIGN KEY (`employeeId`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Selected Assign Training
CREATE TABLE IF NOT EXISTS `selectedassigntraining` (
  `employeeId` int(10) UNSIGNED NOT NULL,
  `skillId` tinyint(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`employeeId`,`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 3. PROJECT MANAGEMENT TABLES
-- ============================================

-- Project
CREATE TABLE IF NOT EXISTS `project` (
  `projectNumber` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `dieName` varchar(255) NOT NULL,
  `dieNumber` varchar(11) NOT NULL,
  `projectStatus` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `projectType` varchar(255) NOT NULL,
  `projectPOLink` varchar(255) DEFAULT NULL,
  `projectDesignDocLink` varchar(255) DEFAULT NULL,
  `projectCreatedBy` int(10) UNSIGNED DEFAULT NULL,
  `updateReason` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `historyOf` int(10) UNSIGNED DEFAULT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`projectNumber`),
  KEY `projectCreatedByForeign` (`projectCreatedBy`),
  KEY `historyOfForeign` (`historyOf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Stage
CREATE TABLE IF NOT EXISTS `stage` (
  `stageId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectNumber` int(10) UNSIGNED NOT NULL,
  `stageName` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `owner` int(10) UNSIGNED DEFAULT NULL,
  `machine` varchar(255) NOT NULL,
  `duration` int(11) NOT NULL,
  `seqPrevStage` int(10) UNSIGNED DEFAULT NULL,
  `createdBy` int(10) UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `historyOf` int(10) UNSIGNED DEFAULT NULL,
  `updateReason` text DEFAULT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`stageId`),
  KEY `projectNumberForeign` (`projectNumber`),
  KEY `seqPrevStageForeign` (`seqPrevStage`),
  KEY `createdByForeign` (`createdBy`),
  KEY `ownerForeign` (`owner`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Substage
CREATE TABLE IF NOT EXISTS `substage` (
  `substageId` int(11) NOT NULL AUTO_INCREMENT,
  `stageId` int(10) UNSIGNED NOT NULL,
  `projectNumber` int(10) UNSIGNED NOT NULL,
  `substageName` varchar(255) DEFAULT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `owner` int(10) UNSIGNED NOT NULL,
  `machine` varchar(255) NOT NULL,
  `duration` int(11) NOT NULL,
  `seqPrevStage` int(10) UNSIGNED DEFAULT NULL,
  `createdBy` int(10) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `historyOf` int(10) UNSIGNED DEFAULT NULL,
  `updateReason` text DEFAULT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`substageId`),
  KEY `substage_stageId_fk` (`stageId`),
  KEY `substage_projectNumber_fk` (`projectNumber`),
  KEY `substage_seqPrevStage_fk` (`seqPrevStage`),
  KEY `fk_owner` (`owner`),
  KEY `fk_createdBy` (`createdBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Substages Master (dropdown list)
CREATE TABLE IF NOT EXISTS `substages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Activity Master
CREATE TABLE IF NOT EXISTS `activity` (
  `activityid` int(11) NOT NULL AUTO_INCREMENT,
  `activity_name` varchar(255) NOT NULL,
  PRIMARY KEY (`activityid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Substage Activity
CREATE TABLE IF NOT EXISTS `substage_activity` (
  `activityId` int(11) NOT NULL AUTO_INCREMENT,
  `substageId` int(11) NOT NULL,
  `activityName` varchar(255) NOT NULL,
  `isCompleted` tinyint(1) NOT NULL DEFAULT 0,
  `createdBy` int(10) UNSIGNED NOT NULL,
  `owner` int(10) UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`activityId`),
  KEY `substageId` (`substageId`),
  KEY `fk_activity_owner` (`owner`),
  CONSTRAINT `fk_activity_owner` FOREIGN KEY (`owner`) REFERENCES `employee` (`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `substage_activity_ibfk_1` FOREIGN KEY (`substageId`) REFERENCES `substage` (`substageId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 4. STAGE TEMPLATE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS `stage_template` (
  `templateId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateName` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `createdBy` int(10) UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`templateId`),
  KEY `fk_template_createdBy` (`createdBy`),
  CONSTRAINT `fk_template_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `stage_template_item` (
  `itemId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateId` int(10) UNSIGNED NOT NULL,
  `stageName` varchar(255) NOT NULL,
  `machine` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `orderIndex` int(11) DEFAULT 0,
  `parentItemId` int(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`itemId`),
  KEY `fk_titem_template` (`templateId`),
  KEY `fk_titem_parent` (`parentItemId`),
  CONSTRAINT `fk_titem_template` FOREIGN KEY (`templateId`) REFERENCES `stage_template` (`templateId`) ON DELETE CASCADE,
  CONSTRAINT `fk_titem_parent` FOREIGN KEY (`parentItemId`) REFERENCES `stage_template_item` (`itemId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 5. BOM / INVENTORY TABLES
-- ============================================

-- Item Master (shared between BOM and Inventory)
CREATE TABLE IF NOT EXISTS `itemmaster` (
  `itemId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `itemCode` varchar(50) NOT NULL,
  `itemName` varchar(100) NOT NULL,
  `specification` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`itemId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BOM Details
CREATE TABLE IF NOT EXISTS `bomdetails` (
  `bomId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `itemId` int(10) UNSIGNED NOT NULL,
  `ELength` decimal(10,2) DEFAULT NULL,
  `EWidth` decimal(10,2) DEFAULT NULL,
  `EHeight` decimal(10,2) DEFAULT NULL,
  `EQuantity` decimal(10,2) DEFAULT NULL,
  `ALength` decimal(10,2) DEFAULT NULL,
  `AWidth` decimal(10,2) DEFAULT NULL,
  `AHeight` decimal(10,2) DEFAULT NULL,
  `AQuantity` decimal(10,2) DEFAULT NULL,
  `projectNumber` int(10) UNSIGNED NOT NULL,
  `stageId` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`bomId`),
  KEY `fk_bom_item` (`itemId`),
  KEY `fk_bom_project` (`projectNumber`),
  KEY `fk_bom_stage` (`stageId`),
  CONSTRAINT `fk_bom_item` FOREIGN KEY (`itemId`) REFERENCES `itemmaster` (`itemId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Item Details (for inventory tracking)
CREATE TABLE IF NOT EXISTS `itemdetails` (
  `itemDetailId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `itemId` int(10) UNSIGNED NOT NULL,
  `length` decimal(10,2) DEFAULT NULL,
  `width` decimal(10,2) DEFAULT NULL,
  `height` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`itemDetailId`),
  KEY `fk_idetail_item` (`itemId`),
  CONSTRAINT `fk_idetail_item` FOREIGN KEY (`itemId`) REFERENCES `itemmaster` (`itemId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 6. TRANSACTIONS TABLES
-- ============================================

-- Vendor Master
CREATE TABLE IF NOT EXISTS `vendor_master` (
  `vendorId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `SupplierName` varchar(100) NOT NULL,
  `contactPerson` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  PRIMARY KEY (`vendorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Transactions Details
CREATE TABLE IF NOT EXISTS `transactions_details` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `itemId` int(10) UNSIGNED DEFAULT NULL,
  `date` date DEFAULT NULL,
  `purchase_order` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `challan` varchar(100) DEFAULT NULL,
  `transaction_type` enum('purchase','issue') NOT NULL,
  `v_id` int(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_trans_item` (`itemId`),
  KEY `fk_trans_vendor` (`v_id`),
  CONSTRAINT `fk_trans_item` FOREIGN KEY (`itemId`) REFERENCES `itemmaster` (`itemId`),
  CONSTRAINT `fk_trans_vendor` FOREIGN KEY (`v_id`) REFERENCES `vendor_master` (`vendorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 7. TICKET TRACKING TABLES
-- ============================================

-- Issue Type
CREATE TABLE IF NOT EXISTS `issue_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `issue` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `issue_type_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ticket Title (preset titles per issue type)
CREATE TABLE IF NOT EXISTS `ticket_title` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `issue_type_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `issue_type_id` (`issue_type_id`),
  CONSTRAINT `ticket_title_ibfk_1` FOREIGN KEY (`issue_type_id`) REFERENCES `issue_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Basic Solution (pre-defined solutions per issue type)
CREATE TABLE IF NOT EXISTS `basic_solution` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `issue_type_id` int(11) NOT NULL,
  `solution` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `issue_type_id` (`issue_type_id`),
  CONSTRAINT `basic_solution_ibfk_1` FOREIGN KEY (`issue_type_id`) REFERENCES `issue_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ticket
CREATE TABLE IF NOT EXISTS `ticket` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `issue_type` varchar(100) DEFAULT NULL,
  `priority` enum('low','mid','high') NOT NULL,
  `status` enum('open','close','pending','hold','reopened') NOT NULL DEFAULT 'open',
  `assignee` varchar(100) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `employee_id` int(10) UNSIGNED DEFAULT NULL,
  `ticket_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_status_updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ticket Attachments
CREATE TABLE IF NOT EXISTS `ticket_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `ticket_attachments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ticket Assignee History
CREATE TABLE IF NOT EXISTS `ticket_assignee_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `changed_by` int(10) UNSIGNED NOT NULL,
  `old_assignee` varchar(255) DEFAULT NULL,
  `new_assignee` varchar(255) NOT NULL,
  `change_reason` text DEFAULT NULL,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `email_sent_to_owner` tinyint(1) DEFAULT 0,
  `email_sent_to_manager` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `tah_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  CONSTRAINT `tah_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ticket Status History
CREATE TABLE IF NOT EXISTS `ticket_status_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `changed_by` int(10) UNSIGNED DEFAULT NULL,
  `old_status` enum('open','close','pending','hold','reopened') NOT NULL,
  `new_status` enum('open','close','pending','hold','reopened') NOT NULL,
  `status_change_reason` text DEFAULT NULL,
  `email_sent_to_owner` tinyint(1) DEFAULT 0,
  `email_sent_to_manager` tinyint(1) DEFAULT 0,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `tsh_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  CONSTRAINT `tsh_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Logs (ticket activity logs)
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `time_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `attachment` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `type` enum('employee_generated','hod_generated','closing_log','require_response_log','resolution_log') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Logs Attachments
CREATE TABLE IF NOT EXISTS `logs_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `log_id` int(11) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `log_id` (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Permissions (ticket permissions)
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `permissionTo` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default permissions
INSERT IGNORE INTO `permissions` (`id`, `permissionTo`) VALUES
(1, 'VIEW_SELF_CREATED_TICKETS'),
(2, 'VIEW_DEPARTMENT_CREATED_TICKETS'),
(3, 'VIEW_DEPARTMENT_ASSIGNED_TICKETS'),
(4, 'VIEW_ALL_TICKETS'),
(5, 'VIEW_ASSIGNED_TICKETS'),
(6, 'CHANGE_TICKET_STATUS'),
(7, 'CHANGE_TICKET_ASSIGNEE'),
(8, 'GET_AND_RELEASE_TICKET'),
(9, 'REOPEN_TICKET');

-- Send Mail To (email notification settings)
CREATE TABLE IF NOT EXISTS `sendmailto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `sendTo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default mail settings
INSERT IGNORE INTO `sendmailto` (`id`, `event`, `sendTo`) VALUES
(1, 'ticketCreated', '00000'),
(2, 'statusChange', '01111'),
(3, 'assigneeChange', '11110'),
(4, 'log', '00110');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
