-- ============================================================
-- AAKAR ERP — Complete College Seed Data
-- Run: Get-Content backend\migrations\college_seed_data.sql | mysql -u root -h 127.0.0.1 aakarerpv1
--
-- This script CLEARS existing data and inserts a full
-- college scenario with departments, designations, employees,
-- skills, trainings, and external trainers.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (order matters due to FKs)
TRUNCATE TABLE attendance;
TRUNCATE TABLE sessions;
TRUNCATE TABLE trainingregistration;
TRUNCATE TABLE trainingskills;
TRUNCATE TABLE training;
TRUNCATE TABLE selectedassigntraining;
TRUNCATE TABLE assigntraining;
TRUNCATE TABLE employeeskill;
TRUNCATE TABLE departmentskill;
TRUNCATE TABLE skill;
TRUNCATE TABLE employeedesignation;
TRUNCATE TABLE designation;
TRUNCATE TABLE employee;
TRUNCATE TABLE department;
TRUNCATE TABLE training_attendees;
TRUNCATE TABLE training_programs;
TRUNCATE TABLE trainers;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. DEPARTMENTS (Think: College departments)
-- ============================================================
INSERT INTO department (departmentId, departmentName, departmentSlug, departmentStartDate) VALUES
(1, 'Computer Science',    'computer-science',    '2024-01-01'),
(2, 'Electronics',         'electronics',         '2024-01-01'),
(3, 'Mechanical',          'mechanical',          '2024-01-01'),
(4, 'Human Resources',     'human-resources',     '2024-01-01');

-- ============================================================
-- 2. DESIGNATIONS (Think: Job titles / roles in the college)
-- ============================================================
-- access string format: "HRaccess,ProjectAccess,TrainingAccess,TicketAccess"
-- Each section has sub-bits controlling Read/Add/Update/Delete etc.
INSERT INTO designation (designationId, designationName, designationSlug, access) VALUES
(1, 'HOD',              'hod',              '1111111111111111,1111,1111111111111111111111,11111'),
(2, 'Professor',        'professor',        '0000000000000000,0000,1000000000000000000000,10000'),
(3, 'Assistant Professor','asst-professor',  '0000000000000000,0000,1000000000000000000000,10000'),
(4, 'Lab Assistant',    'lab-assistant',     '0000000000000000,0000,1000000000000000000000,10000'),
(5, 'HR Manager',       'hr-manager',        '1111111111111111,1111,1111111111111111111111,11111');

-- ============================================================
-- 3. EMPLOYEES (Think: College staff / faculty)
--    Password: "admin123" hashed with bcrypt
-- ============================================================
-- bcrypt hash of "admin123"
SET @pwd = '$2b$10$JioV.NUZHsX83XcZqrZWJeHiRWKEE4V6N656XHJhC96fPC21XGYMy';

INSERT INTO employee (employeeId, customEmployeeId, employeeName, companyName, employeeQualification, experienceInYears, employeeDOB, employeeJoinDate, employeeGender, employeePhone, employeeEmail, employeePassword, employeeAccess) VALUES
-- Computer Science Dept
(1,  'CS-001', 'Dr. Rajesh Sharma',   'ABC College', 'PhD Computer Science',  15, '1978-05-10', '2010-06-01', 'Male',   '9876543210', 'rajesh@college.com',   @pwd, '1111111111111111,1111,1111111111111111111111,11111'),
(2,  'CS-002', 'Prof. Meena Kulkarni', 'ABC College', 'MTech AI/ML',           8,  '1985-03-22', '2016-07-15', 'Female', '9876543211', 'meena@college.com',    @pwd, '0000000000000000,0000,1000000000000000000000,10000'),
(3,  'CS-003', 'Prof. Amit Deshmukh',  'ABC College', 'MTech Cybersecurity',   6,  '1988-11-05', '2018-01-10', 'Male',   '9876543212', 'amit@college.com',     @pwd, '0000000000000000,0000,1000000000000000000000,10000'),
(4,  'CS-004', 'Sneha Patil',          'ABC College', 'BTech CS',              2,  '1995-07-18', '2022-08-01', 'Female', '9876543213', 'sneha@college.com',    @pwd, '0000000000000000,0000,1000000000000000000000,10000'),
-- Electronics Dept
(5,  'EC-001', 'Dr. Vinod Pawar',      'ABC College', 'PhD Electronics',      12, '1980-01-15', '2012-06-01', 'Male',   '9876543214', 'vinod@college.com',    @pwd, '1111111111111111,1111,1111111111111111111111,11111'),
(6,  'EC-002', 'Prof. Kavita Joshi',   'ABC College', 'MTech VLSI',            7,  '1986-09-25', '2017-07-01', 'Female', '9876543215', 'kavita@college.com',   @pwd, '0000000000000000,0000,1000000000000000000000,10000'),
(7,  'EC-003', 'Rahul More',           'ABC College', 'BTech Electronics',     3,  '1993-04-12', '2021-01-15', 'Male',   '9876543216', 'rahul@college.com',    @pwd, '0000000000000000,0000,1000000000000000000000,10000'),
-- Mechanical Dept
(8,  'ME-001', 'Dr. Suresh Gaikwad',   'ABC College', 'PhD Mechanical',       14, '1979-08-20', '2010-06-01', 'Male',   '9876543217', 'suresh@college.com',   @pwd, '1111111111111111,1111,1111111111111111111111,11111'),
(9,  'ME-002', 'Prof. Priya Shinde',   'ABC College', 'MTech Thermal',         5,  '1990-12-03', '2019-07-01', 'Female', '9876543218', 'priya@college.com',    @pwd, '0000000000000000,0000,1000000000000000000000,10000'),
-- HR
(10, 'HR-001', 'Anita Rao',            'ABC College', 'MBA HR',                10, '1982-06-30', '2014-01-01', 'Female', '9876543219', 'anita@college.com',    @pwd, '1111111111111111,1111,1111111111111111111111,11111');

-- ============================================================
-- 4. EMPLOYEE-DESIGNATION MAPPING (who is in which dept + role)
-- ============================================================
INSERT INTO employeedesignation (employeeId, departmentId, designationId, managerId) VALUES
(1,  1, 1, NULL),  -- Dr. Rajesh  → CS HOD (no manager, he is the HOD)
(2,  1, 2, 1),     -- Prof. Meena → CS Professor, reports to Rajesh
(3,  1, 3, 1),     -- Prof. Amit  → CS Asst Prof, reports to Rajesh
(4,  1, 4, 1),     -- Sneha       → CS Lab Assistant, reports to Rajesh
(5,  2, 1, NULL),  -- Dr. Vinod   → EC HOD
(6,  2, 2, 5),     -- Prof. Kavita → EC Professor, reports to Vinod
(7,  2, 4, 5),     -- Rahul       → EC Lab Assistant, reports to Vinod
(8,  3, 1, NULL),  -- Dr. Suresh  → ME HOD
(9,  3, 2, 8),     -- Prof. Priya → ME Professor, reports to Suresh
(10, 4, 5, NULL);  -- Anita       → HR Manager

-- ============================================================
-- 5. SKILLS (Think: Subjects / competencies the college teaches)
-- ============================================================
INSERT INTO skill (skillId, skillName, departmentId, skillDescription, skillActivityStatus) VALUES
-- CS department skills
(1, 'Python Programming',     1, 'Core Python, OOP, Libraries',                      1),
(2, 'Data Structures',        1, 'Arrays, Trees, Graphs, Sorting algorithms',        1),
(3, 'Machine Learning',       1, 'Supervised/Unsupervised learning, Neural Networks', 1),
(4, 'Cybersecurity',          1, 'Network security, Ethical hacking, Encryption',     1),
(5, 'Web Development',        1, 'HTML, CSS, JS, React, Node.js',                    1),
-- EC department skills
(6, 'Circuit Design',         2, 'Analog and digital circuit design',                 1),
(7, 'Embedded Systems',       2, 'Microcontrollers, RTOS, IoT',                      1),
(8, 'VLSI Design',            2, 'Chip design, Verilog, FPGA',                       1),
-- ME department skills
(9,  'AutoCAD',               3, '2D/3D mechanical drawing and modeling',             1),
(10, 'Thermodynamics',        3, 'Heat transfer, Energy systems',                     1),
(11, 'CNC Programming',       3, 'G-code, CNC lathe and milling operations',         1);

-- ============================================================
-- 6. DEPARTMENT-SKILL MAPPING (which dept owns/needs which skill)
--
--    departmentSkillType:
--      1 = "Giving Training" (this dept TEACHES this skill)
--      2 = "Receiving Training" (this dept NEEDS this skill from another dept)
--      3 = "Both — Giving & Applicable" (dept teaches AND uses this skill)
-- ============================================================
INSERT INTO departmentskill (skillId, departmentId, departmentSkillType, departmentSkillStatus) VALUES
-- CS dept GIVES training on all CS skills (type 1)
(1, 1, 1, 1),  -- CS gives Python training
(2, 1, 1, 1),  -- CS gives DS training
(3, 1, 3, 1),  -- CS both gives AND needs ML (type 3)
(4, 1, 3, 1),  -- CS both gives AND needs Cybersecurity (type 3)
(5, 1, 1, 1),  -- CS gives Web Dev training
-- EC dept skills
(6, 2, 1, 1),  -- EC gives Circuit Design
(7, 2, 3, 1),  -- EC gives AND needs Embedded Systems
(8, 2, 1, 1),  -- EC gives VLSI Design
-- ME dept skills
(9,  3, 1, 1), -- ME gives AutoCAD
(10, 3, 3, 1), -- ME gives AND needs Thermodynamics
(11, 3, 1, 1), -- ME gives CNC Programming
-- Cross-department needs (type 2): EC needs Python, ME needs Python & Web Dev
(1, 2, 2, 1),  -- EC department RECEIVES Python training from CS
(5, 3, 2, 1);  -- ME department RECEIVES Web Dev training from CS

-- ============================================================
-- 7. EMPLOYEE-SKILL GRADES (each employee's competency level 0-4)
--
--    Grade scale:
--      0 = Not started / No knowledge
--      1 = Basic awareness
--      2 = Can work with guidance
--      3 = Can work independently
--      4 = Expert / Can TEACH others (becomes eligible as INTERNAL TRAINER)
-- ============================================================
INSERT INTO employeeskill (employeeId, skillId, grade) VALUES
-- Dr. Rajesh (CS HOD) — expert in everything CS
(1, 1, 4), (1, 2, 4), (1, 3, 4), (1, 4, 3), (1, 5, 4),
-- Prof. Meena — expert in ML & Python, good at DS
(2, 1, 4), (2, 2, 3), (2, 3, 4), (2, 4, 2), (2, 5, 3),
-- Prof. Amit — expert in Cybersecurity, good at others
(3, 1, 3), (3, 2, 3), (3, 3, 2), (3, 4, 4), (3, 5, 3),
-- Sneha (Lab Asst) — beginner
(4, 1, 1), (4, 2, 1), (4, 3, 0), (4, 4, 0), (4, 5, 2),
-- Dr. Vinod (EC HOD) — expert in EC skills
(5, 6, 4), (5, 7, 4), (5, 8, 4), (5, 1, 2),
-- Prof. Kavita — expert in VLSI
(6, 6, 3), (6, 7, 3), (6, 8, 4), (6, 1, 1),
-- Rahul (EC Lab Asst)
(7, 6, 2), (7, 7, 1), (7, 8, 1), (7, 1, 0),
-- Dr. Suresh (ME HOD)
(8, 9, 4), (8, 10, 4), (8, 11, 4),
-- Prof. Priya — expert in AutoCAD
(9, 9, 4), (9, 10, 3), (9, 11, 2);

-- ============================================================
-- 8. TRAININGS (Internal — an employee with grade 4 teaches others)
--
--    Example: Prof. Meena (grade 4 in ML) trains others on ML
--    Example: Dr. Rajesh (grade 4 in Python) trains EC dept on Python
-- ============================================================
INSERT INTO training (trainingId, trainerId, trainingTitle, startTrainingDate, endTrainingDate, evaluationType) VALUES
(1, 2, 'Machine Learning Fundamentals',  '2025-10-01', '2025-10-15', 1),  -- Prof. Meena teaches ML
(2, 1, 'Python for Electronics Engineers','2025-10-10', '2025-10-20', 1),  -- Dr. Rajesh teaches Python to EC
(3, 3, 'Cybersecurity Workshop',          '2025-11-01', '2025-11-05', 1),  -- Prof. Amit teaches Cybersecurity
(4, 5, 'Embedded Systems Bootcamp',       '2025-11-10', '2025-11-20', 1);  -- Dr. Vinod teaches Embedded

-- Link trainings to skills
INSERT INTO trainingskills (trainingId, skillId) VALUES
(1, 3),  -- ML Fundamentals → ML skill
(2, 1),  -- Python for EC → Python skill
(3, 4),  -- Cybersecurity Workshop → Cybersecurity skill
(4, 7);  -- Embedded Bootcamp → Embedded Systems skill

-- ============================================================
-- 9. TRAINING REGISTRATIONS (who is enrolled in which training)
-- ============================================================
INSERT INTO trainingregistration (employeeId, trainingId) VALUES
-- ML training: Amit, Sneha enrolled (Prof. Meena is the trainer)
(3, 1), (4, 1),
-- Python for EC: Kavita, Rahul enrolled (Dr. Rajesh is the trainer)
(6, 2), (7, 2),
-- Cybersecurity: Meena, Sneha enrolled (Prof. Amit is the trainer)
(2, 3), (4, 3),
-- Embedded: Kavita, Rahul enrolled (Dr. Vinod is the trainer)
(6, 4), (7, 4);

-- ============================================================
-- 10. SESSIONS (individual class sessions within a training)
-- ============================================================
INSERT INTO sessions (sessionId, sessionName, sessionDate, sessionStartTime, sessionEndTime, trainingId, sessionDescription) VALUES
(1, 'ML - Introduction',      '2025-10-01', '10:00:00', '12:00:00', 1, 'What is ML, types of learning'),
(2, 'ML - Regression Models', '2025-10-03', '10:00:00', '12:00:00', 1, 'Linear & Logistic Regression'),
(3, 'ML - Neural Networks',   '2025-10-05', '10:00:00', '12:00:00', 1, 'Introduction to deep learning'),
(4, 'Python - Basics',        '2025-10-10', '14:00:00', '16:00:00', 2, 'Variables, loops, functions'),
(5, 'Python - Libraries',     '2025-10-12', '14:00:00', '16:00:00', 2, 'NumPy, Pandas, Matplotlib');

-- ============================================================
-- 11. ATTENDANCE (who attended which session)
--     attendanceStatus: 1 = Present, 0 = Absent
-- ============================================================
INSERT INTO attendance (employeeId, sessionId, attendanceStatus) VALUES
(3, 1, 1), (4, 1, 1),   -- ML Session 1: Amit ✓, Sneha ✓
(3, 2, 1), (4, 2, 0),   -- ML Session 2: Amit ✓, Sneha ✗
(3, 3, 1), (4, 3, 1),   -- ML Session 3: Amit ✓, Sneha ✓
(6, 4, 1), (7, 4, 1),   -- Python Session 1: Kavita ✓, Rahul ✓
(6, 5, 1), (7, 5, 0);   -- Python Session 2: Kavita ✓, Rahul ✗

-- ============================================================
-- 12. SELECTED ASSIGN TRAINING (employees nominated for skill training)
-- ============================================================
INSERT INTO selectedassigntraining (employeeId, skillId) VALUES
(4, 1),  -- Sneha nominated for Python training
(4, 3),  -- Sneha nominated for ML training
(7, 1),  -- Rahul nominated for Python training
(7, 7);  -- Rahul nominated for Embedded training

-- ============================================================
-- 13. EXTERNAL TRAINERS (people from outside the college)
-- ============================================================
INSERT INTO trainers (id, trainer_type, employee_id, full_name, email, phone, organization, specialization, password, expiry_date, is_active) VALUES
(1, 'EXTERNAL', NULL, 'Dr. Sanjay Mehta',     'sanjay@techcorp.com',   '9988776655', 'TechCorp India',       'Cloud Computing & AWS',       'ext123', '2026-12-31', 1),
(2, 'EXTERNAL', NULL, 'Ms. Neha Verma',       'neha@datascience.io',   '9988776656', 'DataScience Academy',  'Advanced Data Analytics',     'ext123', '2026-06-30', 1),
(3, 'EXTERNAL', NULL, 'Mr. Ravi Krishnamurthy','ravi@cyberdefend.com',  '9988776657', 'CyberDefend Solutions','Penetration Testing & SOC',   'ext123', '2025-01-01', 0);
-- Note: Ravi's account is expired (expiry_date in past, is_active=0)

-- ============================================================
-- 14. TRAINING PROGRAMS (sessions conducted by external trainers)
-- ============================================================
INSERT INTO training_programs (id, title, description, trainer_id, start_date, end_date, status) VALUES
(1, 'AWS Cloud Practitioner',    'Hands-on AWS fundamentals for faculty',          1, '2025-12-01 09:00:00', '2025-12-05 17:00:00', 'SCHEDULED'),
(2, 'Data Analytics with Python','Advanced analytics workshop for CS department',  2, '2025-11-15 10:00:00', '2025-11-20 16:00:00', 'COMPLETED');

-- Attendees for external training programs
INSERT INTO training_attendees (training_id, employee_id, status, feedback) VALUES
(1, 1, 'ENROLLED', NULL),               -- Dr. Rajesh enrolled in AWS
(1, 2, 'ENROLLED', NULL),               -- Prof. Meena enrolled in AWS
(1, 5, 'ENROLLED', NULL),               -- Dr. Vinod enrolled in AWS
(2, 2, 'COMPLETED', 'Excellent workshop, very practical'), -- Meena completed analytics
(2, 3, 'COMPLETED', 'Good coverage of pandas'),            -- Amit completed analytics
(2, 4, 'ATTENDED', NULL);               -- Sneha attended analytics

SELECT 'Seed data inserted successfully!' AS status;
