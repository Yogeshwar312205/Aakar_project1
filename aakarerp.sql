-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
-- hello
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 03, 2025 at 09:19 AM
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

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`employeeId`, `sessionId`, `attendanceStatus`) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 1, 1),
(2, 2, 1),
(6, 5, 1),
(6, 6, 1),
(7, 5, 1),
(7, 6, 1),
(11, 9, 1),
(11, 10, 1),
(12, 9, 1),
(12, 10, 1),
(16, 13, 1),
(16, 14, 1),
(17, 13, 1),
(17, 14, 1),
(21, 17, 1),
(21, 18, 1),
(22, 17, 1),
(22, 18, 1),
(75, 21, 0);

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`departmentId`, `departmentName`, `departmentSlug`, `departmentStartDate`, `departmentEndDate`) VALUES
(36, 'IT', 'it', '2025-01-30', NULL),
(37, 'UIUX', 'uiux', '2025-01-30', NULL),
(38, 'Production', 'production', '2025-01-30', NULL),
(39, 'Cook', 'cook', '2025-01-31', NULL),
(40, 'HOD', 'hod', '2025-01-31', NULL);

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
  PRIMARY KEY (`designationId`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `designation`
--

INSERT INTO `designation` (`designationId`, `designationName`, `designationSlug`) VALUES
(35, 'Tester', 'tester'),
(36, 'HOD', 'hod'),
(37, 'Pantry', 'pantry'),
(38, 'SESA', 'sesa');

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
  `employeeEmail` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employeePassword` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `employeeAccess` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `employeeRefreshToken` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employeeEndDate` date DEFAULT NULL,
  PRIMARY KEY (`employeeId`),
  UNIQUE KEY `employeeEmail` (`employeeEmail`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`employeeId`, `customEmployeeId`, `employeeName`, `companyName`, `employeeQualification`, `experienceInYears`, `employeeDOB`, `employeeJoinDate`, `employeeGender`, `employeePhone`, `employeeEmail`, `employeePassword`, `employeeAccess`, `createdAt`, `employeeRefreshToken`, `employeeEndDate`) VALUES
(111, 'admin', 'admin', 'admin', 'Graduate', 0, '2004-12-06', '2025-01-01', 'Male', '7887986656', 'admin@gmail.com', 'admin', '1111111111111000000000000000000000000000000000000000,1111111111111000000000000000000000000000000000000000,1111111111111111111111111000000000000000000000000000,1111111110000000000000000000000000000000000000000000', '2025-01-30 13:09:07', NULL, NULL),
(112, 'ram', 'Ram Kapoor', 'Aakar Foundry', 'ITI', 7, '2004-12-11', '2025-01-29', 'Male', '7887546598', 'rushikeshghodkeco2021@gmail.com', '$2b$10$PTRM/bcTTPQajnovyQHaSehmzVw6UoOEZn6KpIWU7F7pbWOOCieZK', '1111111111111000000000000000000000000000000000000000\',1111111111111000000000000000000000000000000000000000\',1111111111111111111111111000000000000000000000000000\',1111111110000000000000000000000000000000000000000000\'', '2025-01-30 13:09:18', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoicmFtIiwiZW1wbG95ZWVFbWFpbCI6InJ1c2hpa2VzaGdob2RrZWNvMjAyMUBnbWFpbC5jb20iLCJpYXQiOjE3Mzg1MTQwNDUsImV4cCI6MTc0MTEwNjA0NX0.zaRm742v3Btae10SK3tJVQ0LJx6wx6T0sbLEqnNNG3I', NULL),
(113, 'viraj', 'Viraj Zuluk', 'Aakar Foundry', 'Diploma', 7, '2004-12-11', '2025-01-29', 'Male', '7887506598', 'viraj.22320052@viit.ac.in', '$2b$10$aujNQSCFDjd/ggA/R9bFteLGodMAScssf3D8FC72ZIokA0b58s8kG', '1111111111111000000000000000000000000000000000000000\',1111111111111000000000000000000000000000000000000000\',1111111111111111111111111000000000000000000000000000\',1111111110000000000000000000000000000000000000000000\'', '2025-01-30 13:09:21', NULL, NULL),
(114, 'ashish', 'Ashish Aher', 'VIIT', 'Diploma', 3, '2004-02-24', '2024-12-31', 'Male', '7458963214', 'ashish.22320200@viit.ac.in', '$2b$10$ivcFck4a7rj7cboEkMKbae/IakmXyR3NLt1xzhhfNf2.3HIU4TO0y', '1111111111111000000000000000000000000000000000000000\',\'0000000000000000000000000000000000000000000000000000\',\'0000000000000000000000000000000000000000000000000000\',\'0000000000000000000000000000000000000000000000000000\'', '2025-01-30 13:19:27', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiYXNoaXNoIiwiZW1wbG95ZWVFbWFpbCI6ImFzaGlzaC4yMjMyMDIwMEB2aWl0LmFjLmluIiwiaWF0IjoxNzM4MjQzMjE3LCJleHAiOjE3NDA4MzUyMTd9.2J0DApUHjXvDjUGRP9XHXPobuUfv8pUQdyoPf026E_Y', NULL),
(115, 'sangmesh', 'Sangmesh Sarsambe', 'VIIT', '12th', 1, '2005-12-25', '2025-01-30', 'Male', '8888888888', 'sangmesh.2231086@viit.ac.in', '$2b$10$AJ.rhJD8qZIiqlPJgIXS4u.RcIyUNniIOri7NFwDpHWQGQcNRhHTG', '1111111111111000000000000000000000000000000000000000\',0000000000000000000000000000000000000000000000000000\',\'0000000000000000000000000000000000000000000000000000\',\'0000000000000000000000000000000000000000000000000000\'', '2025-01-31 10:30:02', NULL, NULL),
(116, 'chaitamya', 'chaitanya poekar', 'VIIT', 'Diploma', 2, '2004-05-13', '2025-01-30', 'Male', '1234263431', 'chaitany.22310385@viit.ac.in', '$2b$10$VDbF5MA1OABWcSpLwJ399eQZINKAsQQHOptBdEjlSRfZ.KHfoCkCm', '\'1111111111111000000000000000000000000000000000000000\',1111111111111000000000000000000000000000000000000000\',0000000000000000000000000000000000000000000000000000\',0000000000000000000000000000000000000000000000000000\'', '2025-01-31 10:30:06', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiY2hhaXRhbXlhIiwiZW1wbG95ZWVFbWFpbCI6ImNoYWl0YW55LjIyMzEwMzg1QHZpaXQuYWMuaW4iLCJpYXQiOjE3MzgzMTk0NjAsImV4cCI6MTc0MDkxMTQ2MH0.SMHMBJqpBo6oJBK6bXCGUZqAGWgZfn_YUDlUUmNQAYY', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employeedesignation`
--

INSERT INTO `employeedesignation` (`employeeDesignationId`, `employeeId`, `departmentId`, `designationId`, `managerId`) VALUES
(53, 112, 36, 35, 111),
(54, 113, 37, 36, 111),
(55, 114, 38, 36, 113),
(56, 115, 39, 37, 113),
(57, 116, 40, 38, 112);

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

--
-- Dumping data for table `selectedassigntraining`
--

INSERT INTO `selectedassigntraining` (`employeeId`, `skillId`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(6, 5),
(6, 6),
(7, 5),
(7, 6),
(11, 9),
(11, 10),
(12, 9),
(12, 10),
(16, 13),
(71, 21);

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

--
-- Dumping data for table `sendmailto`
--

INSERT INTO `sendmailto` (`id`, `event`, `sendTo`) VALUES
(1, 'ticketCreated', '00000'),
(2, 'statusChange', '01111'),
(3, 'assigneeChange', '11110'),
(4, 'log', '00110');

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
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`id`, `title`, `description`, `details`, `department`, `issue_type`, `priority`, `status`, `assignee`, `attachment`, `employee_id`, `ticket_created_at`, `last_status_updated_at`, `createdBy`) VALUES
(1, 'test', 'test', 'test', 'ERP', 'test', 'low', 'open', '', NULL, 74, '2025-01-28 13:28:12', '2025-01-28 13:28:12', 'Rushikesh Ghodke'),
(2, 'test2', 'test2', 'test2', 'ERP', 'test2', 'low', 'open', '', NULL, 1, '2025-01-28 13:35:46', '2025-01-28 13:35:46', ''),
(3, 'demo ticket', 'demo ticket', 'demo ticket', 'ERP', 'demo ticket', 'high', 'open', '', NULL, 74, '2025-01-28 13:53:45', '2025-01-28 13:53:45', 'Rushikesh Ghodke');

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

--
-- Dumping data for table `ticket_attachments`
--

INSERT INTO `ticket_attachments` (`ticket_id`, `attachment`, `id`) VALUES
(2, 'ticketRoutes\\uploads\\1738051546402-610041936-aboutme.png', 1);

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

--
-- Dumping data for table `training`
--

INSERT INTO `training` (`trainingId`, `trainerId`, `startTrainingDate`, `endTrainingDate`, `skillId`, `trainingTitle`, `evaluationType`) VALUES
(21, 74, '2025-01-27', '2025-01-28', NULL, 'data entry training', 1);

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
