-- ============================================================
-- Trainers & Training Records Module — Database Migration
-- Run this SQL against your MySQL database to create the
-- required tables. Does NOT modify any existing tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS `trainers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `trainer_type` ENUM('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'INTERNAL',
  `employee_id` VARCHAR(50) NULL COMMENT 'Used when trainer is Internal (from company)',
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `organization` VARCHAR(150) NULL COMMENT 'Company/firm name if External',
  `specialization` VARCHAR(255) NULL,
  `password` VARCHAR(255) NULL COMMENT 'For External trainer login access',
  `expiry_date` DATE NULL COMMENT 'Auto-deactivation date for External trainers',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `training_programs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `trainer_id` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_training_programs_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `training_attendees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `training_id` INT NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `status` ENUM('ENROLLED', 'ATTENDED', 'ABSENT', 'COMPLETED') DEFAULT 'ENROLLED',
  `feedback` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_training_attendees_program` FOREIGN KEY (`training_id`) REFERENCES `training_programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
