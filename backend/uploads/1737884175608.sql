CREATE DATABASE  IF NOT EXISTS `commondb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `commondb`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: commondb
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assigntraining`
--

DROP TABLE IF EXISTS `assigntraining`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigntraining` (
  `employeeId` int unsigned DEFAULT NULL,
  `employeeName` varchar(50) NOT NULL,
  `skillName` varchar(50) DEFAULT NULL,
  `skillId` tinyint unsigned DEFAULT NULL,
  `grade` tinyint unsigned DEFAULT NULL,
  KEY `skillId` (`skillId`),
  KEY `employeeId` (`employeeId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assigntraining`
--

LOCK TABLES `assigntraining` WRITE;
/*!40000 ALTER TABLE `assigntraining` DISABLE KEYS */;
/*!40000 ALTER TABLE `assigntraining` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `employeeId` int unsigned NOT NULL,
  `sessionId` tinyint unsigned NOT NULL,
  `attendanceStatus` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`employeeId`,`sessionId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `departmentId` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `departmentName` varchar(50) NOT NULL,
  `departmentStartDate` date DEFAULT NULL,
  `departmentEndDate` date DEFAULT NULL,
  PRIMARY KEY (`departmentId`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (12,'Manufacturing','2024-12-22',NULL),(11,'Networking','2024-12-22','2025-01-05'),(10,'Training','2024-12-22',NULL),(9,'UI/UX','2024-12-03','2024-12-25'),(8,'ERP','2024-12-01',NULL),(13,'Testing','2024-12-04','2024-12-25');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departmentskill`
--

DROP TABLE IF EXISTS `departmentskill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departmentskill` (
  `departmentSkillId` int unsigned NOT NULL AUTO_INCREMENT,
  `skillId` tinyint unsigned DEFAULT NULL,
  `departmentId` tinyint unsigned DEFAULT NULL,
  PRIMARY KEY (`departmentSkillId`),
  KEY `skillId` (`skillId`),
  KEY `departmentId` (`departmentId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departmentskill`
--

LOCK TABLES `departmentskill` WRITE;
/*!40000 ALTER TABLE `departmentskill` DISABLE KEYS */;
/*!40000 ALTER TABLE `departmentskill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `designation`
--

DROP TABLE IF EXISTS `designation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designation` (
  `designationId` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `designationName` varchar(50) NOT NULL,
  PRIMARY KEY (`designationId`)
) ENGINE=MyISAM AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `designation`
--

LOCK TABLES `designation` WRITE;
/*!40000 ALTER TABLE `designation` DISABLE KEYS */;
INSERT INTO `designation` VALUES (33,'Full Stack Developer'),(32,'Cook'),(31,'Planner'),(30,'Trainer'),(29,'Tester'),(28,'Department Head'),(27,'Machine Learning Engineer'),(26,'Department Head');
/*!40000 ALTER TABLE `designation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employeeId` int NOT NULL AUTO_INCREMENT,
  `customEmployeeId` varchar(50) NOT NULL,
  `employeeName` varchar(100) NOT NULL,
  `companyName` varchar(100) NOT NULL,
  `employeeQualification` varchar(100) DEFAULT NULL,
  `experienceInYears` int DEFAULT NULL,
  `employeeDOB` date DEFAULT NULL,
  `employeeJoinDate` date DEFAULT NULL,
  `employeeGender` enum('Male','Female','Other') NOT NULL,
  `employeePhone` varchar(20) DEFAULT NULL,
  `employeeEmail` varchar(100) DEFAULT NULL,
  `employeePassword` varchar(255) NOT NULL,
  `employeeAccess` varchar(255) DEFAULT NULL,
  `employeeRefreshToken` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `employeeEndDate` date DEFAULT NULL,
  PRIMARY KEY (`employeeId`),
  UNIQUE KEY `employeeEmail` (`employeeEmail`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (38,'EMP011','Amit Yadav','AF','Diploma',2,'2002-07-19','2024-11-25','Male','9876543210','amit.yadav@af.com','$2b$10$NXIvSP2ULxW8aA.EvBzub.84woHgwIqwq8d2UhU1jIW2WmNYHQege','01000100010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',NULL,'2024-12-22 08:28:53',NULL),(42,'EMP015','Vikas Yadav','AF','ITI',4,'1999-02-14','2024-11-28','Male','9922334455','vikas.yadav@af.com','$2b$10$BqeRGmeF8TQ5uJ6AFCoTdei9K4Vruwy.hlilELCyiDKQif6rP.D7q','01000100010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',NULL,'2024-12-22 08:30:03',NULL),(43,'EMP016','Neha Mehta','AF','Graduate',3,'2001-04-12','2024-12-05','Female','9798765432','neha.mehta@af.com','$2b$10$tgf9nDRvWfETxABR67ljKOVNCmQZ0KDYXKI51Eczf.x6w6qdW4HvG','01000100010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',NULL,'2024-12-22 08:36:27',NULL),(44,'EMP017','Arjun Singh','AF','Diploma',2,'2002-11-28','2024-12-10','Male','9988775544','arjun.singh@af.com','$2b$10$U7MkzHKC3Xr.OuIwHBxCAOU1EApkm1VV5Joo2MpNCl.XuZFsV1Xoy','01000100010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',NULL,'2024-12-22 08:36:36',NULL),(46,'EMP019','Aakash Bharti','AF','ITI',2,'2002-12-09','2024-11-30','Male','9876554433','aakash.bharti@af.com','$2b$10$LBvNrUP2OjaNKHXBEiOIjOVJx7fdxHC7s6peec96/IoXH1d3KMZNm','01000100010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',NULL,'2024-12-22 08:36:52',NULL),(47,'rrr@viit.ac.in','rrr`','rrr@viit.ac.in','10th',3,'2010-05-01','2010-10-09','Female','4545454545','rrr@viit.ac.in','$2b$10$0WLTte.1racD0ltYAOrgruHzUnieK0Umdp6sZAVe/9be805WT4Iza','11000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',NULL,'2025-01-10 06:34:11',NULL),(48,'EMP034','Ram Singh','Aakar','12th',2,'2005-12-11','2023-12-09','Male','7856231478','ram.singh@af.com','$2b$10$wy1829eAC3q1.I.j.xgR/OnZgOouTvqy/bfZibO.6tznMSTl3ar6q','11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjo0OCwiY3VzdG9tRW1wbG95ZWVJZCI6IkVNUDAzNCIsImVtcGxveWVlTmFtZSI6IlJhbSBTaW5naCIsImNvbXBhbnlOYW1lIjoiQWFrYXIiLCJlbXBsb3llZVF1YWxpZmljYXRpb24iOiIxMnRoIiwiZXhwZXJpZW5jZUluWWVhcnMiOjIsImVtcGxveWVlRE9CIjoiMj','2025-01-10 23:24:29',NULL),(49,'EMP098','Ashish Kumar','Aakar','12th',3,'2001-12-24','2023-12-20','Male','5656565656','ashish.kumar@af.com','$2b$10$QT2OFdxj7gRPS83obmUq0ev2Kg7Oibcmg2M5yABD5o1Ka6KIgGeZG','00000000000011110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiRU1QMDk4IiwiZW1wbG95ZWVFbWFpbCI6ImFzaGlzaC5rdW1hckBhZi5jb20iLCJpYXQiOjE3MzY2NzA2MjcsImV4cCI6MTczOTI2MjYyN30.Ngnat-eWKnv3TpztGVBFvVBmjto_Lgq8QHH-ETGki2I','2025-01-10 23:27:17',NULL),(50,'EMP099','Samarth Gune','Aakar','ITI',2,'1998-12-11','2025-01-05','Male','2312456898','samarth.gune@af.com','$2b$10$y5LEYl8sx/tx.aOAgM6.EO6ugVEdixtbIdw6ZatFkExv.59eQYkdS','00000110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiRU1QMDk5IiwiZW1wbG95ZWVFbWFpbCI6InNhbWFydGguZ3VuZUBhZi5jb20iLCJpYXQiOjE3MzY1NzM2NzgsImV4cCI6MTczOTE2NTY3OH0.gQVk7O8Kh9E65mbrC_TZMnFnjYCrcWf0vh8ukbzYdxM','2025-01-10 23:29:23',NULL),(51,'EMP086','Jabbar Singh','Aakar','10th',15,'1965-04-11','2009-12-31','Male','5498231478','jabbar.singh@af.com','$2b$10$58optrDG9F0YXCSk3uyJmOASnYmzH/1S0YD8HcGvG9Y3exEPiINru','01000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',NULL,'2025-01-12 03:02:08',NULL),(52,'EMO067','Gauri Karkhile','VIIT','Graduate',2,'2004-02-13','2023-05-11','Male','8596741254','gauri.karkhile@viit.ac.in','$2b$10$AXMCCrCDrcVisLRnNZLD.eAH39rvmbH4fcuPiZ.3Ls/ntzljzq2Qm','01000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiRU1PMDY3IiwiZW1wbG95ZWVFbWFpbCI6ImdhdXJpLmthcmtoaWxlQHZpaXQuYWMuaW4iLCJpYXQiOjE3MzY2NzEzNDQsImV4cCI6MTczOTI2MzM0NH0.hyXUO9KTEvI4cRKZuDa7v8wDp8znIr4c2Dj4F9EkttE','2025-01-12 03:09:45',NULL),(53,'EMP036','Shweta Pawar','VIIT','Diploma',2,'2003-05-11','2023-12-11','Male','8596742322','shreya.pawar@viit.ac.in','$2b$10$JP0K3.7Pspvf2DV7Od5/7uYiXiKGfHKB3pDS42i/edceXQjmCfj96','01000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiRU1QMDM2IiwiZW1wbG95ZWVFbWFpbCI6InNocmV5YS5wYXdhckB2aWl0LmFjLmluIiwiaWF0IjoxNzM2NjcxNDg5LCJleHAiOjE3MzkyNjM0ODl9.gjvyVbiwFO9Pmt8vPiIZf7MJHz1of6NsTKkhsFgoQvo','2025-01-12 03:14:32',NULL),(54,'EMP115','Ashutosh Korde','VIIT','Graduate',3,'2004-04-20','2024-12-31','Male','1234567888','ashutosh.korde@viit.ac.in','$2b$10$6s4Dvaelmw.rDTp8UrT5LOjy2bP2I9vpVI1vh.CL3xkgQFJoXq1wC','00001100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21FbXBsb3llZUlkIjoiRU1QMTE1IiwiZW1wbG95ZWVFbWFpbCI6ImFzaHV0b3NoLmtvcmRlQHZpaXQuYWMuaW4iLCJpYXQiOjE3MzY2NzUxMDMsImV4cCI6MTczOTI2NzEwM30.gEmhG1t9AppPibZIKacZA6SI1TXeP3ezSvnbX4hBVO4','2025-01-12 04:14:32',NULL),(55,'TEST','test','test','12th',1,'2005-01-11','2025-01-19','Male','7777788888','test@test.com','$2b$10$jqogPAIdZ676aPSteCrvHuB/eI.HfiYLoTZFNnNYr5JDcJmJ0ADrG','1010001000100000000000000000000000000000000000000000,1100010000000000000000000000000000000000000000000000,1001000100000000000000000000000000000000000000000000,1000100010001000100010001000100010000000000000000000',NULL,'2025-01-13 11:34:31',NULL),(56,'EMP056','Krishna Magar','VIIT','Graduate',2,'2004-06-24','2025-01-13','Male','4578963245','krishna.magar@viit.ac.in','$2b$10$jThsAoIMblydX7o.qjM7aOHHFg2hYCaU/cz4Mqmnj4VALy2wI8ALO','1111111111111000000000000000000000000000000000000000,1111111110000000000000000000000000000000000000000000,1010001000000000000000000000000000000000000000000000,1010001000100010001000100010001000000000000000000000',NULL,'2025-01-14 01:08:32',NULL);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeedesignation`
--

DROP TABLE IF EXISTS `employeedesignation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeedesignation` (
  `employeeDesignationId` int unsigned NOT NULL AUTO_INCREMENT,
  `employeeId` int unsigned DEFAULT NULL,
  `departmentId` tinyint unsigned DEFAULT NULL,
  `designationId` tinyint unsigned DEFAULT NULL,
  `managerId` int NOT NULL,
  PRIMARY KEY (`employeeDesignationId`),
  KEY `employeeId` (`employeeId`),
  KEY `departmentId` (`departmentId`),
  KEY `designationId` (`designationId`)
) ENGINE=MyISAM AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeedesignation`
--

LOCK TABLES `employeedesignation` WRITE;
/*!40000 ALTER TABLE `employeedesignation` DISABLE KEYS */;
INSERT INTO `employeedesignation` VALUES (66,56,8,33,6),(65,55,12,31,6),(64,54,8,30,53),(63,53,10,30,52),(62,53,12,29,51),(61,52,12,28,50),(60,51,12,32,46),(59,50,10,30,5),(58,50,12,31,46),(57,49,10,30,5),(56,48,8,29,6),(55,47,12,28,44),(54,46,8,27,6),(53,45,12,27,6),(52,44,8,27,6),(51,43,10,26,6),(50,42,12,27,6),(49,41,12,27,6),(48,40,13,26,6),(47,39,11,26,6),(46,38,12,28,6),(45,37,8,27,6),(44,36,9,26,6);
/*!40000 ALTER TABLE `employeedesignation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeeskill`
--

DROP TABLE IF EXISTS `employeeskill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeskill` (
  `employeeId` int unsigned NOT NULL,
  `skillId` tinyint unsigned NOT NULL,
  `grade` tinyint unsigned DEFAULT NULL,
  `skillTrainingResult` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`employeeId`,`skillId`),
  KEY `skillId` (`skillId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeskill`
--

LOCK TABLES `employeeskill` WRITE;
/*!40000 ALTER TABLE `employeeskill` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeeskill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `projectNumber` int NOT NULL,
  `companyName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `dieName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `dieNumber` varchar(11) COLLATE utf8mb4_general_ci NOT NULL,
  `projectStatus` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `projectType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `projectPOLink` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `projectDesignDocLink` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `projectCreatedBy` int DEFAULT NULL,
  `updateReason` text COLLATE utf8mb4_general_ci,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `historyOf` int DEFAULT NULL,
  `progress` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`projectNumber`),
  KEY `projectCreatedByForeign` (`projectCreatedBy`),
  KEY `historyOfForeign` (`historyOf`),
  CONSTRAINT `historyOfForeign` FOREIGN KEY (`historyOf`) REFERENCES `project` (`projectNumber`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `projectCreatedByForeign` FOREIGN KEY (`projectCreatedBy`) REFERENCES `employee` (`employeeId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,'Mahindra','Motor Part','123','pending','2024-09-20','2024-09-24','web','1736961351350.png','1736961351356.png',38,NULL,'2025-01-15 17:15:51',NULL,70);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `selectedassigntraining`
--

DROP TABLE IF EXISTS `selectedassigntraining`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `selectedassigntraining` (
  `employeeId` int unsigned NOT NULL,
  `skillId` tinyint unsigned NOT NULL,
  PRIMARY KEY (`employeeId`,`skillId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `selectedassigntraining`
--

LOCK TABLES `selectedassigntraining` WRITE;
/*!40000 ALTER TABLE `selectedassigntraining` DISABLE KEYS */;
/*!40000 ALTER TABLE `selectedassigntraining` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `sessionId` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `sessionName` varchar(55) NOT NULL,
  `sessionDate` date DEFAULT NULL,
  `sessionStartTime` time DEFAULT NULL,
  `sessionEndTime` time DEFAULT NULL,
  `trainingId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`sessionId`),
  KEY `trainingId` (`trainingId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skill`
--

DROP TABLE IF EXISTS `skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill` (
  `skillId` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `skillName` varchar(50) DEFAULT NULL,
  `departmentId` tinyint unsigned DEFAULT NULL,
  `skillAddedBy` varchar(50) DEFAULT NULL,
  `departmentIdGivingTraining` tinyint unsigned DEFAULT NULL,
  `skillDescription` varchar(200) DEFAULT NULL,
  `skillStartDate` date DEFAULT NULL,
  `skillEndDate` date DEFAULT NULL,
  `skillActivityStatus` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`skillId`),
  KEY `departmentId` (`departmentId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill`
--

LOCK TABLES `skill` WRITE;
/*!40000 ALTER TABLE `skill` DISABLE KEYS */;
/*!40000 ALTER TABLE `skill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stage`
--

DROP TABLE IF EXISTS `stage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stage` (
  `stageId` int NOT NULL AUTO_INCREMENT,
  `projectNumber` int NOT NULL,
  `stageName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `owner` int DEFAULT NULL,
  `machine` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `duration` int NOT NULL,
  `seqPrevStage` int DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `historyOf` int DEFAULT NULL,
  `updateReason` text COLLATE utf8mb4_general_ci,
  `progress` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`stageId`),
  KEY `projectNumberForeign` (`projectNumber`),
  KEY `seqPrevStageForeign` (`seqPrevStage`),
  KEY `createdByForeign` (`createdBy`),
  KEY `ownerForeign` (`owner`),
  CONSTRAINT `createdByForeign` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ownerForeign` FOREIGN KEY (`owner`) REFERENCES `employee` (`employeeId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `projectNumberForeign` FOREIGN KEY (`projectNumber`) REFERENCES `project` (`projectNumber`),
  CONSTRAINT `seqPrevStageForeign` FOREIGN KEY (`seqPrevStage`) REFERENCES `stage` (`stageId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37767 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stage`
--

LOCK TABLES `stage` WRITE;
/*!40000 ALTER TABLE `stage` DISABLE KEYS */;
INSERT INTO `stage` VALUES (37758,1,'Stage 1','2024-08-20','2024-08-22',38,'machine1',2,NULL,38,'2025-01-15 17:15:51',NULL,NULL,80),(37759,1,'Stage2','2024-08-22','2024-08-24',38,'machine1',2,37758,38,'2025-01-15 17:15:51',NULL,NULL,60),(37761,1,'stage 3','2024-09-27','2024-09-30',38,'machine 3',3,37758,38,'2025-01-15 17:26:06',37760,'machine changed',60),(37762,1,'stage 3','2024-09-27','2024-09-30',38,'machine 3',3,37758,38,'2025-01-15 17:27:12',37760,'machine changed',60),(37763,1,'stage 3','2024-09-27','2024-09-30',38,'machine 3',3,37758,38,'2025-01-15 17:29:16',37760,'machine changed',60),(37764,1,'stage 3','2024-09-27','2024-09-30',38,'machine 3',3,37758,38,'2025-01-15 17:30:12',37760,'machine changed',60);
/*!40000 ALTER TABLE `stage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `substage`
--

DROP TABLE IF EXISTS `substage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `substage` (
  `projectNumber` int NOT NULL,
  `substageId` int NOT NULL AUTO_INCREMENT,
  `stageId` int NOT NULL,
  `stageName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `owner` int NOT NULL,
  `machine` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `duration` int NOT NULL,
  `seqPrevStage` int DEFAULT NULL,
  `createdBy` int NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `historyOf` int DEFAULT NULL,
  `updateReason` text COLLATE utf8mb4_general_ci,
  `progress` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`substageId`)
) ENGINE=InnoDB AUTO_INCREMENT=1256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `substage`
--

LOCK TABLES `substage` WRITE;
/*!40000 ALTER TABLE `substage` DISABLE KEYS */;
INSERT INTO `substage` VALUES (1,1255,37758,'stage 1','2024-09-28','2024-09-30',38,'machine 4',1,8,38,'2025-01-15 17:44:10',1254,'stage name changed',60);
/*!40000 ALTER TABLE `substage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training`
--

DROP TABLE IF EXISTS `training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training` (
  `trainingId` int unsigned NOT NULL AUTO_INCREMENT,
  `trainerId` int unsigned DEFAULT NULL,
  `startTrainingDate` date DEFAULT NULL,
  `endTrainingDate` date DEFAULT NULL,
  `skillId` tinyint unsigned DEFAULT NULL,
  `trainingTitle` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`trainingId`),
  KEY `skillId` (`skillId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training`
--

LOCK TABLES `training` WRITE;
/*!40000 ALTER TABLE `training` DISABLE KEYS */;
/*!40000 ALTER TABLE `training` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainingregistration`
--

DROP TABLE IF EXISTS `trainingregistration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainingregistration` (
  `employeeId` int unsigned DEFAULT NULL,
  `trainingId` int unsigned DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainingregistration`
--

LOCK TABLES `trainingregistration` WRITE;
/*!40000 ALTER TABLE `trainingregistration` DISABLE KEYS */;
/*!40000 ALTER TABLE `trainingregistration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainingskills`
--

DROP TABLE IF EXISTS `trainingskills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainingskills` (
  `trainingId` int unsigned DEFAULT NULL,
  `skillId` tinyint unsigned DEFAULT NULL,
  KEY `trainingId` (`trainingId`),
  KEY `skillId` (`skillId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainingskills`
--

LOCK TABLES `trainingskills` WRITE;
/*!40000 ALTER TABLE `trainingskills` DISABLE KEYS */;
/*!40000 ALTER TABLE `trainingskills` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-16 18:03:32
