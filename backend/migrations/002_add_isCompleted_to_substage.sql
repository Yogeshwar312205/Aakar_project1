-- Migration: Add isCompleted to substage table
ALTER TABLE substage
ADD COLUMN isCompleted TINYINT(1) DEFAULT 0 AFTER progress;
