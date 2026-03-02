-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 19, 2025 at 01:21 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aakarerp`
--

-- --------------------------------------------------------

--
-- Table structure for table `assigntraining`
--

DROP TABLE IF EXISTS `assigntraining`;
CREATE TABLE IF NOT EXISTS `assigntraining` (
  `employeeId` int UNSIGNED DEFAULT NULL,
  `employeeName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `skillName` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `skillId` tinyint UNSIGNED DEFAULT NULL,
  `grade` tinyint UNSIGNED DEFAULT NULL,
  KEY `skillId` (`skillId`),
  KEY `employeeId` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE IF NOT EXISTS `attendance` (
  `employeeId` int UNSIGNED DEFAULT NULL,
  `sessionId` tinyint UNSIGNED DEFAULT NULL,
  `attendanceStatus` tinyint(1) DEFAULT NULL,
  UNIQUE KEY `employeeId` (`employeeId`,`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `basic_solution`
--

DROP TABLE IF EXISTS `basic_solution`;
CREATE TABLE IF NOT EXISTS `basic_solution` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_type_id` int NOT NULL,
  `solution` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `issue_type_id` (`issue_type_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
CREATE TABLE IF NOT EXISTS `department` (
  `departmentId` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `departmentName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `departmentSlug` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `departmentStartDate` date DEFAULT NULL,
  `departmentEndDate` date DEFAULT NULL,
  PRIMARY KEY (`departmentId`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departmentskill`
--

DROP TABLE IF EXISTS `departmentskill`;
CREATE TABLE IF NOT EXISTS `departmentskill` (
  `skillId` tinyint UNSIGNED NOT NULL,
  `departmentId` tinyint UNSIGNED NOT NULL,
  `departmentSkillType` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `departmentSkillStatus` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`skillId`,`departmentId`,`departmentSkillType`),
  KEY `departmentId` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `designation`
--

DROP TABLE IF EXISTS `designation`;
CREATE TABLE IF NOT EXISTS `designation` (
  `designationId` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `designationName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `designationSlug` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `access` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`designationId`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
CREATE TABLE IF NOT EXISTS `employee` (
  `employeeId` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `customEmployeeId` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `employeeName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `companyName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `employeeQualification` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `experienceInYears` int DEFAULT NULL,
  `employeeDOB` date DEFAULT NULL,
  `employeeJoinDate` date DEFAULT NULL,
  `employeeGender` enum('Male','Female','Other') COLLATE utf8mb4_general_ci NOT NULL,
  `employeePhone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employeeEmail` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employeePassword` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `employeeAccess` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `employeeRefreshToken` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employeeEndDate` date DEFAULT NULL,
  PRIMARY KEY (`employeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=281 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`employeeId`, `customEmployeeId`, `employeeName`, `companyName`, `employeeQualification`, `experienceInYears`, `employeeDOB`, `employeeJoinDate`, `employeeGender`, `employeePhone`, `employeeEmail`, `employeePassword`, `employeeAccess`, `createdAt`, `employeeRefreshToken`, `employeeEndDate`) VALUES
(1, '1', 'Rushikesh Ghodke', 'Aakar Foundry', 'B. Tech', 5, '2004-12-06', '2025-04-01', 'Male', '7887986655', 'rushikesh.22320064@viit.ac.in', '$2b$10$Nlb9yYCGonF/PDc0o5iDeuS9Qjg0pijzj8Vn1za904gpfyMacta0K', '1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111', '2025-04-21 06:32:02', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiMSIsImVtcGxveWVlRW1haWwiOiJydXNoaWtlc2guMjIzMjAwNjRAdmlpdC5hYy5pbiIsImlhdCI6MTc0NTIxNzIzOSwiZXhwIjoxNzQ3ODA5MjM5fQ.EtLEno9W9Fy5-vXO5QUV-ipRVPPl4l1sqdhHToIdWsA', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employeedesignation`
--

DROP TABLE IF EXISTS `employeedesignation`;
CREATE TABLE IF NOT EXISTS `employeedesignation` (
  `employeeDesignationId` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `employeeId` int UNSIGNED DEFAULT NULL,
  `departmentId` tinyint UNSIGNED DEFAULT NULL,
  `designationId` tinyint UNSIGNED DEFAULT NULL,
  `managerId` int DEFAULT NULL,
  PRIMARY KEY (`employeeDesignationId`),
  KEY `employeeId` (`employeeId`),
  KEY `departmentId` (`departmentId`),
  KEY `designationId` (`designationId`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employeeskill`
--

DROP TABLE IF EXISTS `employeeskill`;
CREATE TABLE IF NOT EXISTS `employeeskill` (
  `employeeId` int UNSIGNED NOT NULL,
  `skillId` tinyint UNSIGNED NOT NULL,
  `grade` tinyint UNSIGNED DEFAULT NULL,
  `skillTrainingResult` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`employeeId`,`skillId`),
  KEY `skillId` (`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forgotpassword`
--

DROP TABLE IF EXISTS `forgotpassword`;
CREATE TABLE IF NOT EXISTS `forgotpassword` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `otp` varchar(6) NOT NULL,
  `otpExpiry` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employeeId` (`employeeId`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `issue_type`
--

DROP TABLE IF EXISTS `issue_type`;
CREATE TABLE IF NOT EXISTS `issue_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_id` tinyint UNSIGNED DEFAULT NULL,
  `issue` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `time_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `attachment` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `type` enum('employee_generated','hod_generated','closing_log','require_response_log','resolution_log') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `created_by` (`created_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs_attachments`
--

DROP TABLE IF EXISTS `logs_attachments`;
CREATE TABLE IF NOT EXISTS `logs_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `log_id` int DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`log_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `permissionTo` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
CREATE TABLE IF NOT EXISTS `project` (
  `projectNumber` int UNSIGNED NOT NULL,
  `companyName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `dieName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `dieNumber` varchar(11) COLLATE utf8mb4_general_ci NOT NULL,
  `projectStatus` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `projectType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `projectPOLink` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `projectDesignDocLink` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `projectCreatedBy` int UNSIGNED DEFAULT NULL,
  `updateReason` text COLLATE utf8mb4_general_ci,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `historyOf` int UNSIGNED DEFAULT NULL,
  `progress` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`projectNumber`),
  KEY `projectCreatedByForeign` (`projectCreatedBy`),
  KEY `historyOfForeign` (`historyOf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `selectedassigntraining`
--

DROP TABLE IF EXISTS `selectedassigntraining`;
CREATE TABLE IF NOT EXISTS `selectedassigntraining` (
  `employeeId` int UNSIGNED NOT NULL,
  `skillId` tinyint UNSIGNED NOT NULL,
  PRIMARY KEY (`employeeId`,`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sendmailto`
--

DROP TABLE IF EXISTS `sendmailto`;
CREATE TABLE IF NOT EXISTS `sendmailto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `sendTo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `sessionId` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sessionName` varchar(55) COLLATE utf8mb4_general_ci NOT NULL,
  `sessionDate` date DEFAULT NULL,
  `sessionStartTime` time DEFAULT NULL,
  `sessionEndTime` time DEFAULT NULL,
  `trainingId` int UNSIGNED DEFAULT NULL,
  `sessionDescription` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`sessionId`),
  KEY `trainingId` (`trainingId`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skill`
--

DROP TABLE IF EXISTS `skill`;
CREATE TABLE IF NOT EXISTS `skill` (
  `skillId` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `skillName` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departmentId` tinyint UNSIGNED DEFAULT '0',
  `skillAddedBy` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departmentIdGivingTraining` tinyint UNSIGNED DEFAULT '0',
  `skillDescription` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `skillStartDate` date DEFAULT NULL,
  `skillEndDate` date DEFAULT NULL,
  `skillActivityStatus` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`skillId`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stage`
--

DROP TABLE IF EXISTS `stage`;
CREATE TABLE IF NOT EXISTS `stage` (
  `stageId` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectNumber` int UNSIGNED NOT NULL,
  `stageName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `owner` int UNSIGNED DEFAULT NULL,
  `machine` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `duration` int NOT NULL,
  `seqPrevStage` int UNSIGNED DEFAULT NULL,
  `createdBy` int UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `historyOf` int UNSIGNED DEFAULT NULL,
  `updateReason` text COLLATE utf8mb4_general_ci,
  `progress` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`stageId`),
  KEY `projectNumberForeign` (`projectNumber`),
  KEY `seqPrevStageForeign` (`seqPrevStage`),
  KEY `createdByForeign` (`createdBy`),
  KEY `ownerForeign` (`owner`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `substage`
--

DROP TABLE IF EXISTS `substage`;
CREATE TABLE IF NOT EXISTS `substage` (
  `substageId` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `stageId` int UNSIGNED NOT NULL,
  `projectNumber` int UNSIGNED NOT NULL,
  `stageName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `owner` int UNSIGNED NOT NULL,
  `machine` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `duration` int NOT NULL,
  `seqPrevStage` int UNSIGNED DEFAULT NULL,
  `createdBy` int UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `historyOf` int UNSIGNED DEFAULT NULL,
  `updateReason` text COLLATE utf8mb4_general_ci,
  `progress` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`substageId`),
  KEY `substage_stageId_fk` (`stageId`),
  KEY `substage_projectNumber_fk` (`projectNumber`),
  KEY `substage_seqPrevStage_fk` (`seqPrevStage`),
  KEY `fk_owner` (`owner`),
  KEY `fk_createdBy` (`createdBy`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
CREATE TABLE IF NOT EXISTS `ticket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `issue_type` varchar(100) DEFAULT NULL,
  `priority` enum('low','mid','high') NOT NULL,
  `status` enum('open','close','pending','hold','reopened') NOT NULL DEFAULT 'open',
  `assignee` varchar(100) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `employee_id` int UNSIGNED DEFAULT NULL,
  `ticket_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_status_updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_assignee_history`
--

DROP TABLE IF EXISTS `ticket_assignee_history`;
CREATE TABLE IF NOT EXISTS `ticket_assignee_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `changed_by` int UNSIGNED NOT NULL,
  `old_assignee` varchar(255) DEFAULT NULL,
  `new_assignee` varchar(255) NOT NULL,
  `change_reason` text,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `email_sent_to_owner` tinyint(1) DEFAULT '0',
  `email_sent_to_manager` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `changed_by` (`changed_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_attachments`
--

DROP TABLE IF EXISTS `ticket_attachments`;
CREATE TABLE IF NOT EXISTS `ticket_attachments` (
  `ticket_id` int DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_status_history`
--

DROP TABLE IF EXISTS `ticket_status_history`;
CREATE TABLE IF NOT EXISTS `ticket_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `changed_by` int UNSIGNED DEFAULT NULL,
  `old_status` enum('open','close','pending','hold','reopened') NOT NULL,
  `new_status` enum('open','close','pending','hold','reopened') NOT NULL,
  `status_change_reason` text,
  `email_sent_to_owner` tinyint(1) DEFAULT '0',
  `email_sent_to_manager` tinyint(1) DEFAULT '0',
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `changed_by` (`changed_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_title`
--

DROP TABLE IF EXISTS `ticket_title`;
CREATE TABLE IF NOT EXISTS `ticket_title` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_type_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `issue_type_id` (`issue_type_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `training`
--

DROP TABLE IF EXISTS `training`;
CREATE TABLE IF NOT EXISTS `training` (
  `trainingId` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainerId` int UNSIGNED DEFAULT NULL,
  `startTrainingDate` date DEFAULT NULL,
  `endTrainingDate` date DEFAULT NULL,
  `skillId` tinyint UNSIGNED DEFAULT NULL,
  `trainingTitle` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `evaluationType` int DEFAULT NULL,
  PRIMARY KEY (`trainingId`),
  KEY `skillId` (`skillId`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trainingregistration`
--

DROP TABLE IF EXISTS `trainingregistration`;
CREATE TABLE IF NOT EXISTS `trainingregistration` (
  `employeeId` int UNSIGNED NOT NULL,
  `trainingId` int UNSIGNED NOT NULL,
  `trainerFeedback` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`employeeId`,`trainingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trainingskills`
--

DROP TABLE IF EXISTS `trainingskills`;
CREATE TABLE IF NOT EXISTS `trainingskills` (
  `trainingId` int UNSIGNED DEFAULT NULL,
  `skillId` tinyint UNSIGNED DEFAULT NULL,
  KEY `trainingId` (`trainingId`),
  KEY `skillId` (`skillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assigntraining`
--
ALTER TABLE `assigntraining`
  ADD CONSTRAINT `assigntraining_ibfk_1` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`),
  ADD CONSTRAINT `assigntraining_ibfk_2` FOREIGN KEY (`employeeId`) REFERENCES `employee` (`employeeId`);

--
-- Constraints for table `departmentskill`
--
ALTER TABLE `departmentskill`
  ADD CONSTRAINT `departmentskill_ibfk_1` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`),
  ADD CONSTRAINT `departmentskill_ibfk_2` FOREIGN KEY (`departmentId`) REFERENCES `department` (`departmentId`);

--
-- Constraints for table `employeeskill`
--
ALTER TABLE `employeeskill`
  ADD CONSTRAINT `employeeskill_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employee` (`employeeId`),
  ADD CONSTRAINT `employeeskill_ibfk_2` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`);

--
-- Constraints for table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `historyOfForeign` FOREIGN KEY (`historyOf`) REFERENCES `project` (`projectNumber`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `projectCreatedByForeign` FOREIGN KEY (`projectCreatedBy`) REFERENCES `employee` (`employeeId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`trainingId`) REFERENCES `training` (`trainingId`);

--
-- Constraints for table `stage`
--
ALTER TABLE `stage`
  ADD CONSTRAINT `createdByForeign` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ownerForeign` FOREIGN KEY (`owner`) REFERENCES `employee` (`employeeId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `projectNumberForeign` FOREIGN KEY (`projectNumber`) REFERENCES `project` (`projectNumber`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seqPrevStageForeign` FOREIGN KEY (`seqPrevStage`) REFERENCES `stage` (`stageId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `substage`
--
ALTER TABLE `substage`
  ADD CONSTRAINT `fk_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeId`),
  ADD CONSTRAINT `fk_owner` FOREIGN KEY (`owner`) REFERENCES `employee` (`employeeId`),
  ADD CONSTRAINT `substage_projectNumber_fk` FOREIGN KEY (`projectNumber`) REFERENCES `project` (`projectNumber`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `substage_seqPrevStage_fk` FOREIGN KEY (`seqPrevStage`) REFERENCES `substage` (`substageId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `substage_stageId_fk` FOREIGN KEY (`stageId`) REFERENCES `stage` (`stageId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `training`
--
ALTER TABLE `training`
  ADD CONSTRAINT `training_ibfk_1` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`);

--
-- Constraints for table `trainingskills`
--
ALTER TABLE `trainingskills`
  ADD CONSTRAINT `trainingskills_ibfk_1` FOREIGN KEY (`trainingId`) REFERENCES `training` (`trainingId`),
  ADD CONSTRAINT `trainingskills_ibfk_2` FOREIGN KEY (`skillId`) REFERENCES `skill` (`skillId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
