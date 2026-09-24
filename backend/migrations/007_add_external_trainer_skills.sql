-- Migration 007: Add External Trainer Skills and Password
-- This migration adds:
-- 1. externalTrainerSkills junction table to link external trainers with skills
-- 2. Password handling for external trainers (already exists in employee table as employeePassword)

-- Create junction table for external trainer skills
CREATE TABLE IF NOT EXISTS externalTrainerSkills (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employeeId INT UNSIGNED NOT NULL,
    skillId TINYINT UNSIGNED NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employee(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (skillId) REFERENCES skill(skillId) ON DELETE CASCADE,
    UNIQUE KEY unique_trainer_skill (employeeId, skillId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for faster queries
CREATE INDEX idx_trainer_skills ON externalTrainerSkills(employeeId, skillId);

-- Note: employeePassword column already exists in employee table
-- External trainers will use the existing employeePassword field for authentication
