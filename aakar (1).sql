-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 11, 2025 at 09:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aakar`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity`
--

CREATE TABLE `activity` (
  `activityid` int(11) NOT NULL,
  `activity_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity`
--

INSERT INTO `activity` (`activityid`, `activity_name`) VALUES
(21, 'requirement engineering'),
(22, 'work'),
(23, 'coding'),
(24, 'maintainance'),
(25, 'working');

-- --------------------------------------------------------

--
-- Table structure for table `assigntraining`
--

CREATE TABLE `assigntraining` (
  `employeeId` int(10) UNSIGNED DEFAULT NULL,
  `employeeName` varchar(50) NOT NULL,
  `skillName` varchar(50) DEFAULT NULL,
  `skillId` tinyint(3) UNSIGNED DEFAULT NULL,
  `grade` tinyint(3) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `employeeId` int(10) UNSIGNED DEFAULT NULL,
  `sessionId` tinyint(3) UNSIGNED DEFAULT NULL,
  `attendanceStatus` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `basic_solution`
--

CREATE TABLE `basic_solution` (
  `id` int(11) NOT NULL,
  `issue_type_id` int(11) NOT NULL,
  `solution` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `departmentId` tinyint(3) UNSIGNED NOT NULL,
  `departmentName` varchar(50) NOT NULL,
  `departmentSlug` varchar(50) NOT NULL,
  `departmentStartDate` date DEFAULT NULL,
  `departmentEndDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departmentskill`
--

CREATE TABLE `departmentskill` (
  `skillId` tinyint(3) UNSIGNED NOT NULL,
  `departmentId` tinyint(3) UNSIGNED NOT NULL,
  `departmentSkillType` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `departmentSkillStatus` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `designation`
--

CREATE TABLE `designation` (
  `designationId` tinyint(3) UNSIGNED NOT NULL,
  `designationName` varchar(50) NOT NULL,
  `designationSlug` varchar(50) NOT NULL,
  `access` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `employeeId` int(10) UNSIGNED NOT NULL,
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
  `employeeEndDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`employeeId`, `customEmployeeId`, `employeeName`, `companyName`, `employeeQualification`, `experienceInYears`, `employeeDOB`, `employeeJoinDate`, `employeeGender`, `employeePhone`, `employeeEmail`, `employeePassword`, `employeeAccess`, `createdAt`, `employeeRefreshToken`, `employeeEndDate`) VALUES
(1, '1', 'Rushikesh Ghodke', 'Aakar Foundry', 'B. Tech', 5, '2004-12-06', '2025-04-01', 'Male', '7887986655', 'rushikesh.22320064@viit.ac.in', '$2b$10$B79B/LFoHKH2mEf.FpNf8eFMnBApHJGbXJUxQmXB0MLKJ9jjqD6oW', '1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111', '2025-04-21 06:32:02', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiMSIsImVtcGxveWVlRW1haWwiOiJydXNoaWtlc2guMjIzMjAwNjRAdmlpdC5hYy5pbiIsImlhdCI6MTc2MDIxMTY5MiwiZXhwIjoxNzYyODAzNjkyfQ.P0OVqv087hcZdhhdvhaAG6WCWlKmzKKS3qR-Ko2j2Nw', NULL),
(281, 'EMP001', 'Vishnu Uplenchwar', 'TechCorp Pvt Ltd', 'B.Tech Computer Science', 3, '1998-07-15', '2023-06-01', 'Male', '9876543210', 'vishnu123@gmail.com', '$2b$10$wZlIjFSQZ08u7U4eRnIX8OdwGHxD..RulbZEaotZWPjy.R72El0TK', '1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111', '2025-08-22 11:06:06', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiRU1QMDAxIiwiZW1wbG95ZWVFbWFpbCI6InZpc2hudTEyM0BnbWFpbC5jb20iLCJpYXQiOjE3NjAxOTM3MzUsImV4cCI6MTc2Mjc4NTczNX0.eJ1XXFeNeiiSOAmhssGhYgndhMDGscFozMS9KBDZ04A', NULL),
(282, 'EMP001', 'Gaurav Hadge', 'TechCorp Pvt Ltd', 'B.Tech Computer Science', 3, '1998-07-15', '2023-06-01', 'Male', '9876543210', 'gaurav123@gmail.com', '$2b$10$2LPLdx58hnaSG8jGkHgGqO9TPGFTJujC.lJM5uPoF9XwTFGkbXP2W', '1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111,1111111111111111111111111111111111111111111111111111', '2025-08-22 11:07:08', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiRU1QMDAxIiwiZW1wbG95ZWVFbWFpbCI6ImdhdXJhdjEyM0BnbWFpbC5jb20iLCJpYXQiOjE3NTY4ODgyOTEsImV4cCI6MTc1OTQ4MDI5MX0.JEB05mIo5JOF8ArlYyRZh4-e1aNKYxvMWMD-oDH3DFk', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employeedesignation`
--

CREATE TABLE `employeedesignation` (
  `employeeDesignationId` int(10) UNSIGNED NOT NULL,
  `employeeId` int(10) UNSIGNED DEFAULT NULL,
  `departmentId` tinyint(3) UNSIGNED DEFAULT NULL,
  `designationId` tinyint(3) UNSIGNED DEFAULT NULL,
  `managerId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employeeskill`
--

CREATE TABLE `employeeskill` (
  `employeeId` int(10) UNSIGNED NOT NULL,
  `skillId` tinyint(3) UNSIGNED NOT NULL,
  `grade` tinyint(3) UNSIGNED DEFAULT NULL,
  `skillTrainingResult` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `projectNumber` int(10) UNSIGNED NOT NULL,
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
  `progress` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`projectNumber`, `companyName`, `dieName`, `dieNumber`, `projectStatus`, `startDate`, `endDate`, `projectType`, `projectPOLink`, `projectDesignDocLink`, `projectCreatedBy`, `updateReason`, `timestamp`, `historyOf`, `progress`) VALUES
(69, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 1, NULL, '2025-08-21 07:43:12', NULL, 48),
(10000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 1, 'Progress Updated', '2025-09-03 08:47:50', 69, 56),
(20000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:51', 69, 56),
(30000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:52', 69, 56),
(40000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:53', 69, 56),
(50000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:53', 69, 56),
(60000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:53', 69, 56),
(70000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:53', 69, 56),
(80000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:54', 69, 56),
(90000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:54', 69, 56),
(100000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:54', 69, 56),
(110000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:54', 69, 56),
(120000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:54', 69, 56),
(130000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:54', 69, 56),
(140000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:47:55', 69, 56),
(150000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:00', 69, 56),
(160000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:01', 69, 56),
(170000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:01', 69, 56),
(180000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:01', 69, 56),
(190000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:02', 69, 56),
(200000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:02', 69, 56),
(210000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:02', 69, 56),
(220000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:02', 69, 56),
(230000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:03', 69, 56),
(240000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:03', 69, 56),
(250000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Progress Updated', '2025-09-03 08:48:14', 69, 56),
(260000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 281, 'Stage: first stage, Progress Updated', '2025-09-17 13:18:53', 69, 56),
(270000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 1, 'Stage: first stage, Progress Updated', '2025-09-17 13:18:55', 69, 48),
(280000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 1, 'Stage: first stage, Progress Updated', '2025-09-17 13:18:57', 69, 48),
(290000069, 'microsoft', 'abc', '5726', 'Pending', '2025-08-22', '2025-08-23', 'electrinics', '1755861192309.pdf', '1755861192311.pdf', 1, 'Stage: first stage, Progress Updated', '2025-09-17 13:18:59', 69, 48);

-- --------------------------------------------------------

--
-- Table structure for table `selectedassigntraining`
--

CREATE TABLE `selectedassigntraining` (
  `employeeId` int(10) UNSIGNED NOT NULL,
  `skillId` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `sessionId` tinyint(3) UNSIGNED NOT NULL,
  `sessionName` varchar(55) NOT NULL,
  `sessionDate` date DEFAULT NULL,
  `sessionStartTime` time DEFAULT NULL,
  `sessionEndTime` time DEFAULT NULL,
  `trainingId` int(10) UNSIGNED DEFAULT NULL,
  `sessionDescription` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skill`
--

CREATE TABLE `skill` (
  `skillId` tinyint(3) UNSIGNED NOT NULL,
  `skillName` varchar(50) DEFAULT NULL,
  `departmentId` tinyint(3) UNSIGNED DEFAULT 0,
  `skillAddedBy` varchar(50) DEFAULT NULL,
  `departmentIdGivingTraining` tinyint(3) UNSIGNED DEFAULT 0,
  `skillDescription` varchar(200) DEFAULT NULL,
  `skillStartDate` date DEFAULT NULL,
  `skillEndDate` date DEFAULT NULL,
  `skillActivityStatus` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stage`
--

CREATE TABLE `stage` (
  `stageId` int(10) UNSIGNED NOT NULL,
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
  `progress` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stage`
--

INSERT INTO `stage` (`stageId`, `projectNumber`, `stageName`, `startDate`, `endDate`, `owner`, `machine`, `duration`, `seqPrevStage`, `createdBy`, `timestamp`, `historyOf`, `updateReason`, `progress`) VALUES
(15, 69, 'first stage', '2025-08-22', '2025-08-23', 281, 'machine', 2, NULL, 1, '2025-08-21 13:13:12', NULL, NULL, 48),
(16, 69, 'first stage', '2025-08-22', '2025-08-23', 281, 'machine', 2, NULL, 1, '2025-09-17 13:18:53', 15, 'Progress Updated', 56),
(17, 69, 'first stage', '2025-08-22', '2025-08-23', 281, 'machine', 2, NULL, 1, '2025-09-17 13:18:55', 15, 'Progress Updated', 48),
(18, 69, 'first stage', '2025-08-22', '2025-08-23', 281, 'machine', 2, NULL, 1, '2025-09-17 13:18:57', 15, 'Progress Updated', 48),
(19, 69, 'first stage', '2025-08-22', '2025-08-23', 281, 'machine', 2, NULL, 1, '2025-09-17 13:18:59', 15, 'Progress Updated', 48);

-- --------------------------------------------------------

--
-- Table structure for table `substage`
--

CREATE TABLE `substage` (
  `substageId` int(11) NOT NULL,
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
  `progress` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `substage`
--

INSERT INTO `substage` (`substageId`, `stageId`, `projectNumber`, `substageName`, `startDate`, `endDate`, `owner`, `machine`, `duration`, `seqPrevStage`, `createdBy`, `timestamp`, `historyOf`, `updateReason`, `progress`) VALUES
(1, 15, 69, 'Initial Design', '2025-09-16', '2025-09-25', 1, 'CAD-STN-04', 9, NULL, 1, '2025-09-15 20:20:45', NULL, 'Initial Creation', 20),
(3, 15, 69, 'Testing', '2025-10-06', '2025-10-10', 1, 'Test-Bench-01', 5, 2, 1, '2025-09-15 20:37:52', NULL, 'Initial Creation', 75),
(4, 15, 69, 'Prototyping', '2025-09-26', '2025-10-05', 1, 'CNC-MILL-02', 10, 1, 1, '2025-09-15 20:37:52', NULL, 'Initial Creation', 50),
(6, 15, 69, 'requirement_analysis', '2025-09-04', '2025-09-21', 1, 'machine', 4, NULL, 1, '2025-09-20 21:11:18', NULL, NULL, 0),
(8, 15, 69, 'RE', '2025-09-04', '2025-09-21', 1, 'machine', 4, NULL, 1, '2025-09-25 18:24:26', NULL, NULL, 9),
(9, 15, 69, 'coding', '2025-09-04', '2025-09-21', 281, 'machine', 4, NULL, 1, '2025-09-25 18:25:16', NULL, NULL, 9);

-- --------------------------------------------------------

--
-- Table structure for table `substages`
--

CREATE TABLE `substages` (
  `id` int(11) NOT NULL,
  `Name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `substages`
--

INSERT INTO `substages` (`id`, `Name`) VALUES
(1, 'implementation'),
(3, 'coding'),
(4, 'RE'),
(5, 'design'),
(6, 'requirement_analysis');

-- --------------------------------------------------------

--
-- Table structure for table `substage_activity`
--

CREATE TABLE `substage_activity` (
  `activityId` int(11) NOT NULL,
  `substageId` int(11) NOT NULL,
  `activityName` varchar(255) NOT NULL,
  `isCompleted` tinyint(1) NOT NULL DEFAULT 0,
  `createdBy` int(10) UNSIGNED NOT NULL,
  `owner` int(10) UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `substage_activity`
--

INSERT INTO `substage_activity` (`activityId`, `substageId`, `activityName`, `isCompleted`, `createdBy`, `owner`, `timestamp`) VALUES
(1, 1, 'requirement engineering', 1, 1, 1, '2025-09-18 04:30:00'),
(2, 1, 'work', 1, 1, 1, '2025-09-22 09:00:00'),
(3, 1, 'coding', 0, 1, 1, '2025-09-24 05:30:00'),
(4, 6, 'requirement engineering', 1, 5, 1, '2025-09-15 03:45:00'),
(5, 6, 'work', 0, 5, 1, '2025-09-25 10:30:00'),
(6, 9, 'requirement engineering', 1, 3, 1, '2025-09-25 04:00:00'),
(7, 9, 'coding', 0, 3, 1, '2025-09-25 05:30:00'),
(8, 9, 'work', 0, 4, 1, '2025-09-25 09:30:00'),
(9, 3, 'requirement engineering', 0, 2, 1, '2025-09-25 12:30:00'),
(10, 3, 'coding', 0, 2, 1, '2025-09-26 03:30:00'),
(11, 8, 'work', 1, 6, 1, '2025-09-20 06:30:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`activityid`);

--
-- Indexes for table `assigntraining`
--
ALTER TABLE `assigntraining`
  ADD KEY `skillId` (`skillId`),
  ADD KEY `employeeId` (`employeeId`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD UNIQUE KEY `employeeId` (`employeeId`,`sessionId`);

--
-- Indexes for table `basic_solution`
--
ALTER TABLE `basic_solution`
  ADD PRIMARY KEY (`id`),
  ADD KEY `issue_type_id` (`issue_type_id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`departmentId`);

--
-- Indexes for table `departmentskill`
--
ALTER TABLE `departmentskill`
  ADD PRIMARY KEY (`skillId`,`departmentId`,`departmentSkillType`),
  ADD KEY `departmentId` (`departmentId`);

--
-- Indexes for table `designation`
--
ALTER TABLE `designation`
  ADD PRIMARY KEY (`designationId`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`employeeId`);

--
-- Indexes for table `employeedesignation`
--
ALTER TABLE `employeedesignation`
  ADD PRIMARY KEY (`employeeDesignationId`),
  ADD KEY `employeeId` (`employeeId`),
  ADD KEY `departmentId` (`departmentId`),
  ADD KEY `designationId` (`designationId`);

--
-- Indexes for table `employeeskill`
--
ALTER TABLE `employeeskill`
  ADD PRIMARY KEY (`employeeId`,`skillId`),
  ADD KEY `skillId` (`skillId`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`projectNumber`),
  ADD KEY `projectCreatedByForeign` (`projectCreatedBy`),
  ADD KEY `historyOfForeign` (`historyOf`);

--
-- Indexes for table `selectedassigntraining`
--
ALTER TABLE `selectedassigntraining`
  ADD PRIMARY KEY (`employeeId`,`skillId`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sessionId`),
  ADD KEY `trainingId` (`trainingId`);

--
-- Indexes for table `skill`
--
ALTER TABLE `skill`
  ADD PRIMARY KEY (`skillId`);

--
-- Indexes for table `stage`
--
ALTER TABLE `stage`
  ADD PRIMARY KEY (`stageId`),
  ADD KEY `projectNumberForeign` (`projectNumber`),
  ADD KEY `seqPrevStageForeign` (`seqPrevStage`),
  ADD KEY `createdByForeign` (`createdBy`),
  ADD KEY `ownerForeign` (`owner`);

--
-- Indexes for table `substage`
--
ALTER TABLE `substage`
  ADD PRIMARY KEY (`substageId`),
  ADD KEY `substage_stageId_fk` (`stageId`),
  ADD KEY `substage_projectNumber_fk` (`projectNumber`),
  ADD KEY `substage_seqPrevStage_fk` (`seqPrevStage`),
  ADD KEY `fk_owner` (`owner`),
  ADD KEY `fk_createdBy` (`createdBy`);

--
-- Indexes for table `substages`
--
ALTER TABLE `substages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `substage_activity`
--
ALTER TABLE `substage_activity`
  ADD PRIMARY KEY (`activityId`),
  ADD KEY `substageId` (`substageId`),
  ADD KEY `fk_activity_owner` (`owner`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity`
--
ALTER TABLE `activity`
  MODIFY `activityid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `basic_solution`
--
ALTER TABLE `basic_solution`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `departmentId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `designation`
--
ALTER TABLE `designation`
  MODIFY `designationId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `employeeId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=283;

--
-- AUTO_INCREMENT for table `employeedesignation`
--
ALTER TABLE `employeedesignation`
  MODIFY `employeeDesignationId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `sessionId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `skill`
--
ALTER TABLE `skill`
  MODIFY `skillId` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `stage`
--
ALTER TABLE `stage`
  MODIFY `stageId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `substage`
--
ALTER TABLE `substage`
  MODIFY `substageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `substages`
--
ALTER TABLE `substages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `substage_activity`
--
ALTER TABLE `substage_activity`
  MODIFY `activityId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `substage_activity`
--
ALTER TABLE `substage_activity`
  ADD CONSTRAINT `fk_activity_owner` FOREIGN KEY (`owner`) REFERENCES `employee` (`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `substage_activity_ibfk_1` FOREIGN KEY (`substageId`) REFERENCES `substage` (`substageId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
