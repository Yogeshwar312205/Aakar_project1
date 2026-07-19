CREATE DATABASE commonDB1;
USE commonDB1;
DROP DATABASE commonDB1;

DROP TABLE IF EXISTS employee;
CREATE TABLE IF NOT EXISTS employee (
  employeeId int UNSIGNED NOT NULL AUTO_INCREMENT,
  customEmployeeId varchar(50) NOT NULL,
  employeeName varchar(100) NOT NULL,
  companyName varchar(100) NOT NULL,
  employeeQualification varchar(100) DEFAULT NULL,
  experienceInYears int DEFAULT NULL,
  employeeDOB date DEFAULT NULL,
  employeeJoinDate date DEFAULT NULL,
  employeeGender enum('Male','Female','Other') NOT NULL,
  employeePhone varchar(20) DEFAULT NULL,
  employeeEmail varchar(100) DEFAULT NULL,
  employeePassword varchar(255) NOT NULL,
  employeeAccess varchar(255) DEFAULT NULL,
  createdAt timestamp not null default current_timestamp,
  employeeRefreshToken varchar(255) DEFAULT NULL,
  employeeEndDate date DEFAULT NULL,
  PRIMARY KEY (employeeId),
  UNIQUE KEY employeeEmail (employeeEmail)
);

INSERT INTO employee (customEmployeeId, employeeName, companyName, employeeQualification, experienceInYears, employeeDOB, employeeJoinDate, employeeGender, employeePhone, employeeEmail, employeePassword, employeeAccess, employeeRefreshToken) VALUES
('EMP01','Aarav Verma','Company A','MBA',5,NULL,NULL,'Male','1234567890','aarav.verma@example.com','$2a$12$KJmi6f8bKQ6SHZteWdbobe8xsr4B7o7o91pIJQXur.IMD4Mni3Sgu','11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111',NULL),
('EMP02', 'Bharat Singh', 'Company A', 'B.Sc', 4, NULL, NULL, 'Male', '1234567891', 'bharat.singh@example.com', '$2a$12$DLUSzfU9lH2enIbucXB.kOClizYio1eLXh9WW8iDpBzS3wFmbbCm6', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,	11111111111111111111111111111111111111111111111111', NULL),
('EMP03', 'Chitra Kapoor', 'Company A', 'B.Com', 3, NULL, NULL, 'Female', '1234567892', 'chitra.kapoor@example.com', '$2a$12$9A211otjuwmjTrPq1hSmQeDVWp33SmZjIhFq.tN1jbbVUAgYbBRoK', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,01011111111111111111111111111111111111111111111111', NULL),
('EMP04', 'Devansh Rao', 'Company A', 'B.Tech', 2, NULL, NULL, 'Male', '1234567893', 'devansh.rao@example.com', '$2a$12$Ls3SV9h35m.1wJsdI.jP/.43WQBg9KPqdhxh2nnMydOWcWBgATVgW', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,01111111111111111111111111111111111111111111111111', NULL),
('EMP05', 'Esha Sharma', 'Company A', 'M.Sc', 1, NULL, NULL, 'Female', '1234567894', 'esha.sharma@example.com', '$2a$12$38GDGYNAcK6X1wBLhoPRauyiI8ITzItS/7ImQh2EkGPVIpDWeH5YO', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,10011111111111111111111111111111111111111111111111', NULL),

('EMP06', 'Farhan Khan', 'Company B', 'MBA', 5, NULL, NULL, 'Male', '1234567895', 'farhan.khan@example.com', '$2a$12$wOsb2QDcWb2D5sdzuov/Lu26FaXa37eCKdq2A0okTzQ/.nhr9A5bS', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,10111111111111111111111111111111111111111111111111', NULL),
('EMP07', 'Garima Joshi', 'Company B', 'B.Sc', 4, NULL, NULL, 'Female', '1234567896', 'garima.joshi@example.com', '$2a$12$5aZToBKlDxG8jGcgvXlX9eIrSjLssc7mAoPY6xIDml1b.o/5iLzNa', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11011111111111111111111111111111111111111111111111', NULL),
('EMP08', 'Harshit Patel', 'Company B', 'B.Com', 3, NULL, NULL, 'Male', '1234567897', 'harshit.patel@example.com', '$2a$12$kuNy1l9MkFqUTSWwi2aSRO2CBi7MBDqLuyuOKJzHTe/q153blV40C', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP09', 'Ishita Nair', 'Company B', 'B.Tech', 2, NULL, NULL, 'Female', '1234567898', 'ishita.nair@example.com', '$2a$12$pVXBXIPELxafQ2VRYmTQnOMah7Pc0DZ6dIfqV8E0oXOB9ag1dS3oe', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP10', 'Jayant Sen', 'Company B', 'M.Sc', 1, NULL, NULL, 'Male', '1234567899', 'jayant.sen@example.com', '$2a$12$7egRxyahtH5j1joNSGMM0.JPLje9WUxDUhXGzchksnixaXKcuYo4K', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),

('EMP11', 'Kabir Das', 'Company C', 'MBA', 5, NULL, NULL, 'Male', '1234567800', 'kabir.das@example.com', '$2a$12$visiX7FOF.evL2LkAv8.Ue6qMyiz4re63oRnFz1evtWopE/Nj8Lme', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP12', 'Lavanya Pillai', 'Company C', 'B.Sc', 4, NULL, NULL, 'Female', '1234567801', 'lavanya.pillai@example.com', '$2a$12$ShpUQSFC68HqHL7EQqEs.e69.8qOVpUra3GZnYrXXoFyjwVao7TXS', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP13', 'Meera Krishnan', 'Company C', 'B.Com', 3, NULL, NULL, 'Female', '1234567802', 'meera.krishnan@example.com', '$2a$12$i54KwmdiqvpP1mUBtYx1QuJjUdsuWlMbmJ/5hGz6hX7c2R9HMAUo2', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP14', 'Nikhil Aggarwal', 'Company C', 'B.Tech', 2, NULL, NULL, 'Male', '1234567803', 'nikhil.aggarwal@example.com', '$2a$12$fRmOAh/Q1yoqxe7VF/QkMe.NvotgP2poBfTEFcvGOLD4FrslJxlRy', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP15', 'Omkar Jain', 'Company C', 'M.Sc', 1, NULL, NULL, 'Male', '1234567804', 'omkar.jain@example.com', '$2a$12$DZGTRXtv/0U71MOaXQSGqu/T2JboK3z4mC4mD6Ngl2/f3tAOsnN9K', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL);

INSERT INTO employee (customEmployeeId, employeeName, companyName, employeeQualification, experienceInYears, employeeDOB, employeeJoinDate, employeeGender, employeePhone, employeeEmail, employeePassword, employeeAccess, employeeRefreshToken) VALUES
('EMP16', 'Arjun Malhotra', 'Company D', 'MBA', 5, NULL, NULL, 'Male', '1234567805', 'arjun.malhotra@example.com', 'arjun', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP17', 'Rohan Gupta', 'Company D', 'B.Sc', 4, NULL, NULL, 'Male', '1234567806', 'rohan.gupta@example.com', '$2a$12$u4KhwLI1VJy0XrGgG1YixuTKDiSw0mFDoxwfQFE6z/vKlJjTlgWsK', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP18', 'Sneha Mehta', 'Company D', 'B.Com', 3, NULL, NULL, 'Female', '1234567807', 'sneha.mehta@example.com', '$2a$12$QXH0HHegPWkq5viJKYOUs.vB60mcw1IKiIu1aplcWZaZilHfaPzR2', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP19', 'Tarun Iyer', 'Company D', 'B.Tech', 2, NULL, NULL, 'Male', '1234567808', 'tarun.iyer@example.com', '$2a$12$SFV3FZ9.3W9yIC8OQyV/cu9pUM8U8dJk409UWPj6Ybn3.onR5IAHC', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL),
('EMP20', 'Uma Sharma', 'Company D', 'M.Sc', 1, NULL, NULL, 'Female', '1234567809', 'uma.sharma@example.com', '$2a$12$6vAl7uYv0dbSB.GoIoUQPu7KA3sIJLy0Kh2K9sKRMU9vabzkWP6F2', '11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111,11111111111111111111111111111111111111111111111111', NULL);


DROP TABLE IF EXISTS department;
CREATE TABLE IF NOT EXISTS department (
  departmentId tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  departmentName varchar(50) NOT NULL,
  departmentStartDate date DEFAULT NULL,
  departmentEndDate date DEFAULT NULL,
  PRIMARY KEY (departmentId)
);

-- Insert Departments
INSERT INTO department (departmentName) VALUES
('HR'),
('IT'),
('Finance'),
('Sales'),
('Marketing');


DROP TABLE IF EXISTS designation;
CREATE TABLE IF NOT EXISTS designation (
  designationId tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  designationName varchar(50) NOT NULL,
  PRIMARY KEY (designationId)
);


INSERT INTO designation (designationId,designationName) VALUES
(1,'Admin'),(2,'HOD'),(3,'Executive'),(4,'Assignee');


DROP TABLE IF EXISTS employeedesignation;
CREATE TABLE IF NOT EXISTS employeedesignation (
  employeeDesignationId int UNSIGNED NOT NULL AUTO_INCREMENT,
  employeeId int UNSIGNED,
  departmentId tinyint UNSIGNED DEFAULT NULL,
  designationId tinyint UNSIGNED DEFAULT NULL,
  managerId INT DEFAULT NULL,
  PRIMARY KEY (employeeDesignationId),
  KEY employeeId (employeeId),
  KEY departmentId (departmentId),
  KEY designationId (designationId)
) ;


-- Assign Employee Designations
INSERT INTO employeeDesignation (employeeId, departmentId, designationId) VALUES
(1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 1), (5, 1, 1),
(6, 2, 1), (7, 2, 2), (8, 2, 3), (9, 2, 1), (10, 2, 1),
(11, 3, 1), (12, 3, 2), (13, 3, 3), (14, 3, 1), (15, 3, 1),
(16, 4, 1), (17, 4, 2), (18, 4, 3), (19, 4, 1), (20, 4, 1),
(21, 5, 1), (22, 5, 2), (23, 5, 3), (24, 5, 1), (25, 5, 1);

CREATE TABLE skill(
    skillId TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skillName VARCHAR(50),
    departmentId TINYINT UNSIGNED default 0,
    skillAddedBy VARCHAR(50) default null,
    departmentIdGivingTraining TINYINT UNSIGNED default 0,
    skillDescription VARCHAR(200),
    skillStartDate DATE default null,
    skillEndDate DATE default null,
    skillActivityStatus BOOLEAN DEFAULT TRUE
    -- FOREIGN KEY (departmentId) REFERENCES department(departmentId)
);

CREATE TABLE departmentSkill (
    -- departmentSkillId INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skillId TINYINT UNSIGNED,
    departmentId TINYINT UNSIGNED,
    departmentSkillType TINYINT UNSIGNED default 0,
    departmentSkillStatus boolean default 1,
    primary key (skillId,departmentId,departmentSkillType),
    FOREIGN KEY (skillId) REFERENCES skill(skillId),
    FOREIGN KEY (departmentId) REFERENCES department(departmentId)
);
CREATE TABLE employeeSkill(
    employeeId INT UNSIGNED,
    skillId TINYINT UNSIGNED,
    grade TINYINT UNSIGNED,
    skillTrainingResult BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(employeeId, skillId),
    FOREIGN KEY (employeeId) REFERENCES employee(employeeId),
    FOREIGN KEY (skillId) REFERENCES skill(skillId)
);

Create table training(
	trainingId INT UNSIGNED auto_increment primary key,
    trainerId INT UNSIGNED,
	startTrainingDate date,
	endTrainingDate date,
	skillId tinyint unsigned,
    trainingTitle VARCHAR(50),
    foreign key (skillId) references skill(skillId)
);
alter table training add column evaluationType INT;
create table assignTraining(
	employeeId INT UNSIGNED,
	employeeName varchar(50) NOT NULL,
	skillName varchar(50),
	skillId TINYINT UNSIGNED,
	grade TINYINT UNSIGNED,
	foreign key (skillId) references skill(skillId),
	foreign key (employeeId) references employee(employeeId)
);

CREATE TABLE sessions(
    sessionId TINYINT unsigned AUTO_INCREMENT PRIMARY KEY,
    sessionName VARCHAR(55) NOT NULL,
    sessionDate date,
    sessionStartTime time,
    sessionEndTime time,
    trainingId int Unsigned,
    FOREIGN KEY (trainingId) REFERENCES training(trainingId)
);

ALTER TABLE sessions add column sessionDescription VARCHAR(100);

CREATE TABLE trainingRegistration(
	employeeId INT UNSIGNED,
    trainingId INT UNSIGNED,
    primary key(employeeId,trainingId)
);
ALTER TABLE trainingRegistration add column trainerFeedback boolean;
CREATE TABLE attendance(
	employeeId INT UNSIGNED,
    sessionId TINYINT UNSIGNED,
    attendanceStatus BOOLEAN
);
ALTER TABLE attendance ADD UNIQUE KEY (employeeId, sessionId);

SELECT * FROM attendance;

CREATE TABLE trainingSkills(
	trainingId INT UNSIGNED,
    skillId TINYINT UNSIGNED,
    FOREIGN KEY (trainingId) REFERENCES training(trainingId),
    FOREIGN KEY (skillId) REFERENCES skill(skillId)
);

CREATE TABLE selectedAssignTraining(
	employeeId INT UNSIGNED,
	skillId TINYINT UNSIGNED,
	PRIMARY KEY(employeeId,skillId)
);


-- Insert Skills
INSERT INTO skill (skillName, departmentId, skillAddedBy, departmentIdGivingTraining, skillDescription, skillStartDate, skillEndDate) VALUES
('Recruitment', 1, 'Alice Johnson', 1, 'Skill related to recruitment processes', '2023-01-01', '2023-06-01'),
('Employee Relations', 1, 'Alice Johnson', 1, 'Skill for managing employee relations', '2023-02-01', '2023-07-01'),
('Payroll Management', 1, 'Alice Johnson', 1, 'Skill in payroll processing', '2023-03-01', '2023-08-01'),
('Training & Development', 1, 'Alice Johnson', 1, 'Skill in training employees', '2023-04-01', '2023-09-01'),

('Java Programming', 2, 'Frank White', 2, 'Skill in Java programming', '2023-01-01', '2023-06-01'),
('Web Development', 2, 'Frank White', 2, 'Skill in web development', '2023-02-01', '2023-07-01'),
('Database Management', 2, 'Frank White', 2, 'Skill in database management', '2023-03-01', '2023-08-01'),
('Network Security', 2, 'Frank White', 2, 'Skill in network security', '2023-04-01', '2023-09-01'),

('Financial Analysis', 3, 'Liam Taylor', 3, 'Skill in financial analysis', '2023-01-01', '2023-06-01'),
('Budgeting', 3, 'Liam Taylor', 3, 'Skill in budgeting processes', '2023-02-01', '2023-07-01'),
('Taxation', 3, 'Liam Taylor', 3, 'Skill in taxation regulations', '2023-03-01', '2023-08-01'),
('Investment Strategies', 3, 'Liam Taylor', 3, 'Skill in investment strategies', '2023-04-01', '2023-09-01'),

('Sales Strategies', 4, 'Quinn Martin', 4, 'Skill in sales strategies', '2023-01-01', '2023-06-01'),
('Customer Relationship', 4, 'Quinn Martin', 4, 'Skill in customer relationship management', '2023-02-01', '2023-07-01'),
('Market Research', 4, 'Quinn Martin', 4, 'Skill in market research techniques', '2023-03-01', '2023-08-01'),
('Negotiation Skills', 4, 'Quinn Martin', 4, 'Skill in negotiation techniques', '2023-04-01', '2023-09-01'),

('Digital Marketing', 5, 'Victor Walker', 5, 'Skill in digital marketing', '2023-01-01', '2023-06-01'),
('Content Creation', 5, 'Victor Walker', 5, 'Skill in content creation', '2023-02-01', '2023-07-01'),
('SEO Strategies', 5, 'Victor Walker', 5, 'Skill in SEO strategies', '2023-03-01', '2023-08-01'),
('Social Media Management', 5, 'Victor Walker', 5, 'Skill in social media management', '2023-04-01', '2023-09-01');


-- Insert Employee Skills
INSERT INTO employeeSkill (employeeId, skillId, grade) VALUES
(1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4),
(2, 1, 1), (2, 2, 2), (2, 3, 3), (2, 4, 4),
(3, 1, 1), (3, 2, 2), (3, 3, 3), (3, 4, 4),
(4, 1, 1), (4, 2, 2), (4, 3, 3), (4, 4, 4),
(5, 1, 1), (5, 2, 2), (5, 3, 3), (5, 4, 4),

(6, 5, 1), (6, 6, 2), (6, 7, 3), (6, 8, 4),
(7, 5, 1), (7, 6, 2), (7, 7, 3), (7, 8, 4),
(8, 5, 1), (8, 6, 2), (8, 7, 3), (8, 8, 4),
(9, 5, 1), (9, 6, 2), (9, 7, 3), (9, 8, 4),
(10, 5, 1), (10, 6, 2), (10, 7, 3), (10, 8, 4),

(11, 9, 1), (11, 10, 2), (11, 11, 3), (11, 12, 4),
(12, 9, 1), (12, 10, 2), (12, 11, 3), (12, 12, 4),
(13, 9, 1), (13, 10, 2), (13, 11, 3), (13, 12, 4),
(14, 9, 1), (14, 10, 2), (14, 11, 3), (14, 12, 4),
(15, 9, 1), (15, 10, 2), (15, 11, 3), (15, 12, 4),

(16, 13, 1), (16, 14, 2), (16, 15, 3), (16, 16, 4),
(17, 13, 1), (17, 14, 2), (17, 15, 3), (17, 16, 4),
(18, 13, 1), (18, 14, 2), (18, 15, 3), (18, 16, 4),
(19, 13, 1), (19, 14, 2), (19, 15, 3), (19, 16, 4),
(20, 13, 1), (20, 14, 2), (20, 15, 3), (20, 16, 4);


-- Insert Trainings
INSERT INTO training (trainerId, startTrainingDate, endTrainingDate, skillId, trainingTitle) VALUES
(1, '2023-05-01', '2023-05-10', 1, 'Recruitment Training'),
(1, '2023-07-01', '2023-07-10', 2, 'Employee Relations Training'),
(1, '2023-06-01', '2023-06-10', 1, 'Recruitment Training'),
(1, '2023-08-01', '2023-08-10', 2, 'Employee Relations Training'),

(2, '2023-05-01', '2023-05-10', 5, 'Java Programming Training'),
(2, '2023-07-01', '2023-07-10', 6, 'Web Development Training'),
(2, '2023-06-01', '2023-06-10', 5, 'Java Programming Training'),
(2, '2023-08-01', '2023-08-10', 6, 'Web Development Training'),

(3, '2023-05-01', '2023-05-10', 9, 'Financial Analysis Training'),
(3, '2023-07-01', '2023-07-10', 10, 'Budgeting Training'),
(3, '2023-06-01', '2023-06-10', 9, 'Financial Analysis Training'),
(3, '2023-08-01', '2023-08-10', 10, 'Budgeting Training'),

(4, '2023-05-01', '2023-05-10', 13, 'Sales Strategies Training'),
(4, '2023-07-01', '2023-07-10', 14, 'Customer Relationship Training'),
(4, '2023-06-01', '2023-06-10', 13, 'Sales Strategies Training'),
(4, '2023-08-01', '2023-08-10', 14, 'Customer Relationship Training'),

(5, '2023-05-01', '2023-05-10', 17, 'Digital Marketing Training'),
(5, '2023-07-01', '2023-07-10', 18, 'Content Creation Training'),
(5, '2023-06-01', '2023-06-10', 17, 'Digital Marketing Training'),
(5, '2023-08-01', '2023-08-10', 18, 'Content Creation Training');

-- Insert Sessions
INSERT INTO sessions (sessionName, sessionDate, sessionStartTime, sessionEndTime, trainingId) VALUES
('Session 1A', '2023-05-02', '09:00:00', '10:00:00', 1),
('Session 1B', '2023-05-03', '11:00:00', '12:00:00', 1),
('Session 2A', '2023-07-02', '09:00:00', '10:00:00', 2),
('Session 2B', '2023-07-03', '11:00:00', '12:00:00', 2),

('Session 3A', '2023-05-02', '09:00:00', '10:00:00', 5),
('Session 3B', '2023-05-03', '11:00:00', '12:00:00', 5),
('Session 4A', '2023-07-02', '09:00:00', '10:00:00', 6),
('Session 4B', '2023-07-03', '11:00:00', '12:00:00', 6),

('Session 5A', '2023-05-02', '09:00:00', '10:00:00', 9),
('Session 5B', '2023-05-03', '11:00:00', '12:00:00', 9),
('Session 6A', '2023-07-02', '09:00:00', '10:00:00', 10),
('Session 6B', '2023-07-03', '11:00:00', '12:00:00', 10),

('Session 7A', '2023-05-02', '09:00:00', '10:00:00', 13),
('Session 7B', '2023-05-03', '11:00:00', '12:00:00', 13),
('Session 8A', '2023-07-02', '09:00:00', '10:00:00', 14),
('Session 8B', '2023-07-03', '11:00:00', '12:00:00', 14),

('Session 9A', '2023-05-02', '09:00:00', '10:00:00', 17),
('Session 9B', '2023-05-03', '11:00:00', '12:00:00', 17),
('Session 10A', '2023-07-02', '09:00:00', '10:00:00', 18),
('Session 10B', '2023-07-03', '11:00:00', '12:00:00', 18);

-- Insert Training Registrations
INSERT INTO trainingRegistration (employeeId, trainingId) VALUES
(1, 1), (1, 2), 
(2, 1), (2, 2),
(6, 5), (6, 6),
(7, 5), (7, 6),
(11, 9), (11, 10),
(12, 9), (12, 10),
(16, 13), (16, 14),
(17, 13), (17, 14),
(21, 17), (21, 18),
(22, 17), (22, 18);

-- Insert Attendance
INSERT INTO attendance (employeeId, sessionId, attendanceStatus) VALUES
(1, 1, TRUE), (1, 2, TRUE),
(2, 1, TRUE), (2, 2, TRUE),
(6, 5, TRUE), (6, 6, TRUE),
(7, 5, TRUE), (7, 6, TRUE),
(11, 9, TRUE), (11, 10, TRUE),
(12, 9, TRUE), (12, 10, TRUE),
(16, 13, TRUE), (16, 14, TRUE),
(17, 13, TRUE), (17, 14, TRUE),
(21, 17, TRUE), (21, 18, TRUE),
(22, 17, TRUE), (22, 18, TRUE);

-- Insert Training Skills
INSERT INTO trainingSkills (trainingId, skillId) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(5, 5), (5, 6),
(6, 5), (6, 6),
(9, 9), (9, 10),
(10, 9), (10, 10),
(13, 13), (13, 14),
(14, 13), (14, 14),
(17, 17), (17, 18),
(18, 17), (18, 18);

-- Insert Selected Assign Training
INSERT INTO selectedAssignTraining (employeeId, skillId) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(6, 5), (6, 6),
(7, 5), (7, 6),
(11, 9), (11, 10),
(12, 9), (12, 10),
(16,13);


-- drop table departmentSkill;
INSERT INTO departmentSkill(skillId, departmentId, departmentSkillType) VALUES
(1, 1, 3), (2, 1, 3), (3, 1, 3), (4, 1, 3), (5, 1, 1),
(6, 2, 1), (7, 2, 3), (8, 2, 3), (9, 2, 2), (10, 2, 2);
	
DROP TABLE IF EXISTS `basic_solution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basic_solution` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_type_id` int NOT NULL,
  `solution` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `issue_type_id` (`issue_type_id`),
  CONSTRAINT `basic_solution_ibfk_1` FOREIGN KEY (`issue_type_id`) REFERENCES `issue_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basic_solution`
--

LOCK TABLES `basic_solution` WRITE;
/*!40000 ALTER TABLE `basic_solution` DISABLE KEYS */;
INSERT INTO `basic_solution` VALUES (1,1,'Restart the software and check for updates.'),(2,1,'Reinstall the software to fix potential corruption.'),(3,2,'Check network cables and router connection.'),(4,2,'Restart the router and check the network settings.'),(5,3,'Ensure that all leave fields are filled correctly before submission.'),(6,3,'Contact HR if there is a problem with the leave portal.'),(7,4,'Verify payment details and check the payroll system for errors.'),(9,7,'Log the error and report it to the development team.'),(10,7,'Check the software version and update if necessary.'),(11,1,'testing'),(12,2,'testing'),(13,7,'testing');
/*!40000 ALTER TABLE `basic_solution` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `issue_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issue_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_id` tinyint unsigned DEFAULT NULL,
  `issue` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `issue_type_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`departmentId`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issue_type`
--

LOCK TABLES `issue_type` WRITE;
/*!40000 ALTER TABLE `issue_type` DISABLE KEYS */;
INSERT INTO `issue_type` VALUES (1,1,'Software Related Issue'),(2,1,'Network Issue'),(3,2,'Leave Application Issue'),(4,2,'Payroll Issue'),(5,2,'Sales Report Issue'),(6,2,'Campaign Issue'),(7,1,'Software Bug'),(8,1,'Hardware Issue'),(9,2,'Leave Request'),(11,2,'testing');
/*!40000 ALTER TABLE `issue_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int DEFAULT NULL,
  `created_by` int unsigned NULL,
  `time_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `attachment` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `type` enum('employee_generated','hod_generated','closing_log','require_response_log','resolution_log') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (72,3,5,'2025-01-13 01:29:25',NULL,'test','require_response_log'),(73,125,5,'2025-01-13 01:56:21',NULL,'test','require_response_log'),(74,126,1,'2025-01-14 12:45:21',NULL,'test','require_response_log');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_attachments`
--

DROP TABLE IF EXISTS `logs_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `log_id` int DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`log_id`),
  CONSTRAINT `logs_attachments_ibfk_1` FOREIGN KEY (`log_id`) REFERENCES `ticket` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_attachments`
--

LOCK TABLES `logs_attachments` WRITE;
/*!40000 ALTER TABLE `logs_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `permissionTo` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'VIEW_SELF_CREATED_TICKETS'),(2,'VIEW_DEPARTMENT_CREATED_TICKETS'),(3,'VIEW_DEPARTMENT_ASSIGNED_TICKETS'),(4,'VIEW_ALL_TICKETS'),(5,'VIEW_ASSIGNED_TICKETS'),(6,'CHANGE_TICKET_STATUS'),(7,'CHANGE_TICKET_ASSIGNEE'),(8,'GET_AND_RELEASE_TICKET'),(9,'REOPEN_TICKET');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `sendmailto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sendmailto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `sendTo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sendmailto`
--

LOCK TABLES `sendmailto` WRITE;
/*!40000 ALTER TABLE `sendmailto` DISABLE KEYS */;
INSERT INTO `sendmailto` VALUES (1,'ticketCreated','00000'),(2,'statusChange','01111'),(3,'assigneeChange','11110'),(4,'log','00110');
/*!40000 ALTER TABLE `sendmailto` ENABLE KEYS */;
UNLOCK TABLES;

select * from ticket;
DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
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
  `employee_id` int UNSIGNED,
  `ticket_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_status_updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES (1,'Website Down','The company website is not accessible.','Investigating issue with the server.','IT','Software Issue','high','open','John Doe','website_error.png',5,'2024-08-08 13:13:53','2025-01-14 15:58:07',NULL);(2,'Payroll Issue','Employee payroll not processed correctly.','Looking into the payroll system.','QA','Payroll Issue','mid','pending','Michael Brown','payroll_issue.pdf',6,'2024-08-08 13:13:53','2024-08-08 13:13:53',NULL),(3,'Sales Report Error','Error in generating monthly sales report.','Checking the sales report module.','Purchase','Sales Report Issue','mid','close','','sales_error.xlsx',5,'2024-08-08 13:13:53','2025-01-13 15:45:02',NULL),(4,'Network Issue','Internet is very slow.','Network diagnosis in progress.','IT','Network Issue','low','close','John Doe','network_issue.png',5,'2024-08-08 13:13:53','2024-09-27 00:46:05',NULL),(125,'Software Not Responding','','','IT','Software Related Issue','low','hold','Chinmay Kulkarni',NULL,5,'2025-01-13 00:36:14','2025-01-14 15:56:11',NULL),(126,'Software Not Responding','','','IT','Software Related Issue','low','open','Sudhanshu Dave',NULL,5,'2025-01-13 01:23:11','2025-01-14 15:55:01',NULL),(127,'Software Not Responding','','','IT','Software Related Issue','low','open','Chinmay Kulkarni',NULL,5,'2025-01-13 01:25:45','2025-01-13 15:58:31',NULL),(128,'Software Not Responding','test','','IT','Software Related Issue','low','open','',NULL,47,'2025-01-13 17:27:01','2025-01-13 17:27:01',NULL),(129,'Software Not Responding','','','IT','Software Related Issue','low','open','',NULL,47,'2025-01-13 17:28:40','2025-01-13 17:28:40',NULL),(130,'Software Not Responding','','','IT','Software Related Issue','low','open','',NULL,1,'2025-01-14 13:00:17','2025-01-14 17:04:07','Ashutosh Korde');
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_assignee_history`
--

DROP TABLE IF EXISTS `ticket_assignee_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_assignee_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `changed_by` int unsigned NOT NULL,
  `old_assignee` varchar(255) DEFAULT NULL,
  `new_assignee` varchar(255) NOT NULL,
  `change_reason` text,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `email_sent_to_owner` tinyint(1) DEFAULT '0',
  `email_sent_to_manager` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `ticket_assignee_history_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  CONSTRAINT `ticket_assignee_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_assignee_history`
--

LOCK TABLES `ticket_assignee_history` WRITE;
/*!40000 ALTER TABLE `ticket_assignee_history` DISABLE KEYS */;
INSERT INTO `ticket_assignee_history` VALUES (43,125,5,'','Chinmay Kulkarni','','2025-01-13 15:30:43',0,0),(44,127,5,'','Chinmay Kulkarni','','2025-01-13 15:50:39',0,0),(45,126,1,'','Sudhanshu Dave','','2025-01-14 12:45:44',0,0);
/*!40000 ALTER TABLE `ticket_assignee_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_attachments`
--

DROP TABLE IF EXISTS `ticket_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_attachments` (
  `ticket_id` int DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `ticket_attachments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_attachments`
--

LOCK TABLES `ticket_attachments` WRITE;
/*!40000 ALTER TABLE `ticket_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_status_history`
--

DROP TABLE IF EXISTS `ticket_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `changed_by` int unsigned DEFAULT NULL,
  `old_status` enum('open','close','pending','hold','reopened') NOT NULL,
  `new_status` enum('open','close','pending','hold','reopened') NOT NULL,
  `status_change_reason` text,
  `email_sent_to_owner` tinyint(1) DEFAULT '0',
  `email_sent_to_manager` tinyint(1) DEFAULT '0',
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `ticket_status_history_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  CONSTRAINT `ticket_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `employee` (`employeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_status_history`
--

LOCK TABLES `ticket_status_history` WRITE;
/*!40000 ALTER TABLE `ticket_status_history` DISABLE KEYS */;
INSERT INTO `ticket_status_history` VALUES (62,3,5,'close','hold','',0,0,'2025-01-13 15:43:57'),(63,3,5,'hold','close','',0,0,'2025-01-13 15:45:03'),(64,1,5,'close','open','',0,0,'2025-01-13 15:45:30'),(65,127,5,'open','close','',0,0,'2025-01-13 15:48:42'),(66,126,5,'open','hold','',0,0,'2025-01-13 15:54:51'),(67,127,5,'close','pending','',0,0,'2025-01-13 15:56:23'),(68,127,5,'pending','open','',0,0,'2025-01-13 15:58:32'),(69,126,1,'hold','open','',0,0,'2025-01-14 15:55:01'),(70,1,1,'open','hold','',0,0,'2025-01-14 15:55:31'),(74,130,1,'hold','open','',0,0,'2025-01-14 17:04:08');
/*!40000 ALTER TABLE `ticket_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_title`
--

DROP TABLE IF EXISTS `ticket_title`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_title` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_type_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `issue_type_id` (`issue_type_id`),
  CONSTRAINT `ticket_title_ibfk_1` FOREIGN KEY (`issue_type_id`) REFERENCES `issue_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_title`
--

LOCK TABLES `ticket_title` WRITE;
/*!40000 ALTER TABLE `ticket_title` DISABLE KEYS */;
INSERT INTO `ticket_title` VALUES (1,1,'Software Not Responding'),(2,1,'Application Crashes on Startup'),(3,2,'Internet Connectivity Problem'),(4,2,'Cannot Connect to the VPN'),(5,3,'Leave Application Not Processing'),(6,3,'Unable to Submit Leave Request'),(8,4,'Payroll Error in System'),(9,7,'Bug in Software Update'),(10,7,'Unexpected Error During Operation'),(11,1,'testing testing');
/*!40000 ALTER TABLE `ticket_title` ENABLE KEYS */;
UNLOCK TABLES;
