# 🎓 Training Management System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Skill Matrix & Grading System](#skill-matrix--grading-system)
4. [Trainer Qualification Logic](#trainer-qualification-logic)
5. [Training Workflow](#training-workflow)
6. [Module Breakdown](#module-breakdown)
7. [Business Rules](#business-rules)

---

## System Overview

The Training Management System is a comprehensive employee skill development platform with the following key components:

### Core Modules
1. **Skills Management** - Define and categorize skills by department
2. **Skill Matrix** - Track employee proficiency levels (grades 1-4)
3. **Trainer Qualification** - Auto-identify eligible trainers based on grade 4 mastery
4. **Training Programs** - Schedule and manage training sessions
5. **Training Assignment** - Assign employees to required trainings
6. **Training Records** - Track attendance, feedback, and completion

---

## Database Schema

### 1. **skill** Table
Stores all skills in the system.

```sql
CREATE TABLE skill (
  skillId TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  skillName VARCHAR(50),
  departmentId TINYINT UNSIGNED,           -- Department that needs this skill
  skillAddedBy VARCHAR(50),
  departmentIdGivingTraining TINYINT UNSIGNED, -- Department that can train this skill
  skillDescription VARCHAR(200),
  skillStartDate DATE,
  skillEndDate DATE,
  skillActivityStatus TINYINT(1) DEFAULT 1  -- 1=active, 0=inactive
);
```

**Key Fields:**
- `departmentId` - The department that NEEDS this skill
- `departmentIdGivingTraining` - The department that CAN PROVIDE training for this skill

---

### 2. **departmentSkill** Table
Maps skills to departments with different relationship types.

```sql
CREATE TABLE departmentskill (
  skillId TINYINT UNSIGNED NOT NULL,
  departmentId TINYINT UNSIGNED NOT NULL,
  departmentSkillType TINYINT UNSIGNED NOT NULL DEFAULT 0,
  departmentSkillStatus TINYINT(1) DEFAULT 1,
  PRIMARY KEY (skillId, departmentId, departmentSkillType)
);
```

**departmentSkillType Values:**
- `1` = **"Giving Training"** - This department can TRAIN others in this skill
- `2` = **"Expected Skill"** - This department NEEDS employees to have this skill (deprecated/legacy)
- `3` = **"Applicable to my department"** - This department's employees MUST learn this skill

**Example:**
```
Manufacturing Department needs "Welding" skill:
- skillId=5, departmentId=2, departmentSkillType=3 (Applicable to my department)

Production Department can train "Welding":
- skillId=5, departmentId=3, departmentSkillType=1 (Giving Training)
```

---

### 3. **employeeSkill** Table (Skill Matrix)
Tracks each employee's proficiency level in each skill.

```sql
CREATE TABLE employeeskill (
  employeeId INT UNSIGNED NOT NULL,
  skillId TINYINT UNSIGNED NOT NULL,
  grade TINYINT UNSIGNED,              -- 1, 2, 3, or 4
  skillTrainingResult TINYINT(1) DEFAULT 0,
  PRIMARY KEY (employeeId, skillId)
);
```

**Grade System:**
- **Grade 1** - Beginner (Basic understanding)
- **Grade 2** - Intermediate (Can perform with supervision)
- **Grade 3** - Advanced (Can perform independently)
- **Grade 4** - Expert/Master (Can TRAIN others) ⭐

---

### 4. **training** Table
Stores training program details.

```sql
CREATE TABLE training (
  trainingId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  trainerId INT UNSIGNED,              -- Employee ID of trainer
  startTrainingDate DATE,
  endTrainingDate DATE,
  trainingTitle VARCHAR(50),
  evaluationType INT                   -- Type of evaluation/assessment
);
```

---

### 5. **trainingSkills** Table
Links training programs to the skills they teach (many-to-many).

```sql
CREATE TABLE trainingskills (
  trainingId INT UNSIGNED,
  skillId TINYINT UNSIGNED
);
```

**Why Separate Table?**
- One training can teach MULTIPLE skills
- Example: "Advanced Manufacturing" training teaches Welding + Machining + Quality Control

---

### 6. **trainingRegistration** Table
Tracks which employees are enrolled in which trainings.

```sql
CREATE TABLE trainingregistration (
  employeeId INT UNSIGNED NOT NULL,
  trainingId INT UNSIGNED NOT NULL,
  trainerFeedback TINYINT(1),          -- Pass/Fail feedback from trainer
  PRIMARY KEY (employeeId, trainingId)
);
```

---

### 7. **assignTraining** & **selectedAssignTraining** Tables

**assignTraining** - Temporary staging table for manager's skill assignment UI
```sql
CREATE TABLE assigntraining (
  employeeId INT UNSIGNED,
  employeeName VARCHAR(50) NOT NULL,
  skillName VARCHAR(50),
  skillId TINYINT UNSIGNED,
  grade TINYINT UNSIGNED
);
```

**selectedAssignTraining** - Final confirmed skill assignments
```sql
CREATE TABLE selectedassigntraining (
  employeeId INT UNSIGNED NOT NULL,
  skillId TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (employeeId, skillId)
);
```

**Usage Flow:**
1. Manager views employees in department
2. Manager checks skills each employee needs to learn
3. Data temporarily stored in `assignTraining`
4. On "Save", data moves to `selectedAssignTraining`
5. Employees in `selectedAssignTraining` are eligible for training programs

---

### 8. **sessions** & **attendance** Tables

**sessions** - Individual training sessions (classes)
```sql
CREATE TABLE sessions (
  sessionId TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sessionName VARCHAR(55) NOT NULL,
  sessionDate DATE,
  sessionStartTime TIME,
  sessionEndTime TIME,
  trainingId INT UNSIGNED,
  sessionDescription VARCHAR(100)
);
```

**attendance** - Tracks employee attendance per session
```sql
CREATE TABLE attendance (
  employeeId INT UNSIGNED,
  sessionId TINYINT UNSIGNED,
  attendanceStatus TINYINT(1),         -- 1=present, 0=absent
  UNIQUE KEY (employeeId, sessionId)
);
```

---

### 9. **trainers** Table (NEW - External Trainers Module)
Stores both internal and external trainers.

```sql
CREATE TABLE trainers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trainer_type ENUM('INTERNAL', 'EXTERNAL') DEFAULT 'INTERNAL',
  employee_id VARCHAR(50) NULL,        -- For INTERNAL trainers
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  organization VARCHAR(150),           -- For EXTERNAL trainers
  specialization VARCHAR(255),
  password VARCHAR(255),               -- For EXTERNAL trainer login
  expiry_date DATE,                    -- Auto-deactivation for EXTERNAL
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Skill Matrix & Grading System

### The 4-Square Rule (Trainer Qualification)

**Business Rule:** An employee becomes eligible to be a TRAINER when they achieve **Grade 4 in ALL required skills** for their department.

### Visual Example:

#### Manufacturing Department Required Skills:
```
┌──────────────┬────────┬─────────┬────────────────┐
│ Employee     │ Welding│ Machining│ Quality Control│
├──────────────┼────────┼─────────┼────────────────┤
│ John Doe     │   4    │    4    │       4        │ ✅ CAN BE TRAINER
│ Jane Smith   │   4    │    3    │       4        │ ❌ Cannot train (Machining=3)
│ Bob Wilson   │   4    │    4    │       2        │ ❌ Cannot train (QC=2)
└──────────────┴────────┴─────────┴────────────────┘
```

### How Grade 4 is Determined:

**Manager updates grades in "Update Skill" page:**

1. Manager views skill matrix for department
2. Sees each employee's current grade (1-4) for each skill
3. Updates grade based on:
   - Training completion
   - Performance reviews
   - Skill assessments
   - Work experience
4. When employee reaches Grade 4 in ALL department skills → Auto-eligible as trainer

### Code Logic (Backend):

```javascript
// From managerGiveTraining.js - Line 11
router.get('/trainer-employee', (req, res) => {
  const { skillIds } = req.query;

  // Step 1: Get skills with departmentSkillType = 3 (Applicable to my department)
  const query1 = `
    SELECT DISTINCT skillId, departmentId, departmentSkillType
    FROM departmentSkill
    WHERE skillId IN (${placeholders})
      AND (departmentSkillType = 1 OR departmentSkillType = 3)
  `;

  // Step 2: Find employees with Grade 4 in ALL required skills
  const finalQuery = `
    SELECT DISTINCT ed.employeeId, e.employeeName
    FROM employee e
    INNER JOIN employeeSkill es ON e.employeeId = es.employeeId
    JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
    WHERE es.skillId IN (${placeholdersSkill})
      AND es.grade = 4
      AND ed.departmentId = ?
    GROUP BY ed.employeeId
    HAVING COUNT(DISTINCT es.skillId) = ${type3Skills.length}
  `;
});
```

**Key Points:**
- `WHERE es.grade = 4` - Only consider Grade 4 employees
- `HAVING COUNT(DISTINCT es.skillId) = ${type3Skills.length}` - Must have Grade 4 in ALL required skills

---

## Trainer Qualification Logic

### Scenario: Manufacturing Training for "Welding"

**Training Requirements:**
- Skill: Welding (skillId=5)
- Department: Manufacturing (departmentId=2)

**Step 1: Check departmentSkill table**
```sql
SELECT * FROM departmentSkill 
WHERE skillId = 5 AND departmentId = 2;
```

Result:
```
skillId=5, departmentId=2, departmentSkillType=3 (Applicable to my department)
```

**Step 2: Find eligible trainers**
```sql
SELECT e.employeeId, e.employeeName
FROM employee e
INNER JOIN employeeSkill es ON e.employeeId = es.employeeId
INNER JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
WHERE es.skillId = 5 
  AND es.grade = 4
  AND ed.departmentId = 2;
```

**Result:**
```
employeeId=101, employeeName='John Doe'    -- Grade 4 in Welding ✅
employeeId=205, employeeName='Sarah Lee'   -- Grade 4 in Welding ✅
```

**If Multiple Skills Required:**
Training teaches: Welding (5) + Machining (7) + Quality Control (9)

```sql
SELECT ed.employeeId, e.employeeName
FROM employee e
INNER JOIN employeeSkill es ON e.employeeId = es.employeeId
JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
WHERE es.skillId IN (5, 7, 9)
  AND es.grade = 4
  AND ed.departmentId = 2
GROUP BY ed.employeeId
HAVING COUNT(DISTINCT es.skillId) = 3;  -- Must have all 3 skills at grade 4
```

---

## Training Workflow

### Complete Training Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    TRAINING WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

1. SKILL DEFINITION
   ├─ Manager creates skills in system
   ├─ Assigns skill to department (departmentSkill)
   └─ Sets departmentSkillType:
      ├─ Type 1: "Giving Training" (can train others)
      └─ Type 3: "Applicable to my department" (need to learn)

2. SKILL ASSIGNMENT
   ├─ Manager views employees in "Update Skill" page
   ├─ Checks which employees need which skills
   ├─ Data saved to selectedAssignTraining table
   └─ Employees now appear in "need training" list

3. SKILL MATRIX UPDATE
   ├─ Manager tracks employee skill levels
   ├─ Updates grades (1-4) in employeeSkill table
   └─ When employee reaches grade 4 in ALL required skills:
      → Employee becomes TRAINER ELIGIBLE ⭐

4. TRAINING CREATION
   ├─ Manager creates training program
   ├─ Selects training title, dates
   ├─ Selects skills to be taught (trainingSkills)
   ├─ System suggests eligible trainers (grade 4 in all skills)
   └─ Manager selects trainer from list

5. EMPLOYEE ENROLLMENT
   ├─ System shows employees who:
      │  ├─ Are in selectedAssignTraining
      │  ├─ Need the skills taught in this training
      │  └─ Are in the same department
   ├─ Manager selects employees to enroll
   └─ Data saved to trainingRegistration table

6. SESSION SCHEDULING
   ├─ Trainer creates individual sessions
   ├─ Sets date, time, description
   └─ Data saved to sessions table

7. ATTENDANCE TRACKING
   ├─ Trainer marks attendance per session
   ├─ Data saved to attendance table
   └─ Generates attendance reports

8. TRAINING COMPLETION
   ├─ Trainer provides feedback (Pass/Fail)
   ├─ Updates trainerFeedback in trainingRegistration
   ├─ Manager reviews results
   └─ Updates employeeSkill grades based on performance

9. TRAINER STATUS TRACKING
   ├─ View all trainers (internal + external)
   ├─ Track training programs conducted
   ├─ Monitor employee training progress
   └─ Generate training records/reports
```

---

## Module Breakdown

### 1. **Skills Management** (`UpdateSkill.jsx`)

**Location:** `Manager > Update Skill`

**Purpose:** 
- Define skills for departments
- Set which departments can train vs need training
- Manage skill lifecycle (activate/deactivate)

**Key Features:**
```javascript
// Skills can be:
// 1. "Giving Training" (departmentSkillType=1)
// 2. "Applicable to my department" (departmentSkillType=3)

const trainingOptions = [
  { label: "Giving Training", id: 1 },
  { label: "Applicable to my department", id: 3 }
];
```

**Example:**
- Manufacturing needs "Welding" → Type 3
- Production can train "Welding" → Type 1

---

### 2. **Skill Matrix** (`SkillMatrix*.jsx` files)

**Location:** `Manager > Skill Matrix Report`

**Purpose:**
- View employee skill proficiency
- Update employee grades (1-4)
- Track skill development progress

**The 4-Square Grid:**
```
Employee: John Doe | Department: Manufacturing

┌─────────────┬───────┬────────────┬───────────────┬────────────┐
│ Skill       │ Grade │ Welding    │ Machining     │ Quality    │
├─────────────┼───────┼────────────┼───────────────┼────────────┤
│ Current     │       │     3      │      4        │     4      │
│ Status      │       │ Need Train │  Can Train    │ Can Train  │
└─────────────┴───────┴────────────┴───────────────┴────────────┘

✅ When ALL squares = 4 → Employee becomes TRAINER ELIGIBLE
```

**Grade Update API:**
```javascript
// backend/controllers/grade.js
router.post('/update-grade', (req, res) => {
  const { employeeId, skillId, grade } = req.body;
  
  const query = `
    UPDATE employeeSkill 
    SET grade = ? 
    WHERE employeeId = ? AND skillId = ?
  `;
  
  connection.query(query, [grade, employeeId, skillId], ...);
});
```

---

### 3. **Assign Training** (`ShowTrainingDept.jsx`)

**Location:** `Manager > Assign Training`

**Purpose:**
- Select employees who need training
- Assign specific skills to learn
- Saves to selectedAssignTraining table

**Flow:**
```
1. Manager selects department
2. Views all employees in department
3. For each employee, checks skills they need
4. Clicks checkboxes to assign skills
5. Saves → employeeSkill records created
6. Employees now appear in "training eligible" lists
```

---

### 4. **Training Plan** (`AddTraining.jsx`, `AllTraining.jsx`)

**Location:** `Manager > Training Management > Add Training`

**Purpose:**
- Create new training programs
- Select skills to teach
- Choose trainer from eligible list
- Set training dates

**Trainer Selection Logic:**
```javascript
// API: /trainer-employee?skillIds=5,7,9
// Returns employees with Grade 4 in ALL selected skills

Example Response:
[
  { employeeId: 101, employeeName: 'John Doe' },
  { employeeId: 205, employeeName: 'Sarah Lee' }
]
```

---

### 5. **Training Assignment** (`SendConformEmpToTraining.jsx`)

**Location:** `Manager > Training Management > Enroll Employees`

**Purpose:**
- View created training programs
- See eligible employees (from selectedAssignTraining)
- Enroll employees in training
- Saves to trainingRegistration table

**Eligible Employees API:**
```javascript
// /eligible-employee-to-send-to-training?trainingId=X&departmentId=Y

SELECT sa.employeeId, sa.skillId, s.skillName, e.employeeName
FROM trainingSkills ts
INNER JOIN selectedAssigntraining sa ON sa.skillId = ts.skillId
INNER JOIN employee e ON e.employeeId = sa.employeeId
INNER JOIN employeeDesignation ed ON ed.employeeId = sa.employeeId
WHERE ts.trainingId = ? 
  AND ed.departmentId = ?
  AND sa.employeeId != t.trainerId  -- Can't enroll trainer in their own training
```

---

### 6. **Trainer Status** (`TrainersPage.jsx`)

**Location:** `Training Management > Trainers`

**Purpose:**
- View all trainers (internal + external)
- Add external trainers (consultants, vendors)
- Track trainer details
- Monitor expiry dates for external trainers

**Trainer Types:**

**INTERNAL Trainers:**
- Existing employees with Grade 4 skills
- Linked to employee record via employee_id
- No password (use company login)
- No expiry date

**EXTERNAL Trainers:**
- Third-party consultants, vendors
- Not in employee table
- Have separate login credentials
- Have expiry_date for contract end
- Auto-deactivated when expired

**API: POST /api/trainers**
```javascript
{
  trainer_type: "EXTERNAL",
  full_name: "John Smith",
  email: "john@consultingfirm.com",
  phone: "555-1234",
  organization: "TechTraining Inc",
  specialization: "Advanced Welding",
  password: "hashed_password",
  expiry_date: "2026-12-31"
}
```

---

### 7. **Training Records** (`TrainingRecordsPage.jsx`)

**Location:** `Training Management > Training Records`

**Purpose:**
- View all training history
- Track completion status
- Generate reports
- Audit training compliance

**Data Shown:**
- Training title and dates
- Trainer name
- Enrolled employees
- Attendance records
- Pass/Fail feedback
- Skills taught
- Department information

---

### 8. **Trainer POV** (Trainer Portal)

**Files:**
- `TrainerSwitch.jsx` - Trainer dashboard
- `TrainerTrainingDetails.jsx` - View assigned trainings
- `EmployeeTrainingEnrolled.jsx` - See enrolled employees
- `TrainerAttendance.jsx` - Mark attendance
- `TrainerViewAttendance.jsx` - View attendance history
- `TrainerEditAttendance.jsx` - Edit attendance
- `TrainerReportGenerator.jsx` - Generate reports

**Trainer Capabilities:**
1. View assigned training programs
2. Create training sessions
3. Mark employee attendance per session
4. Provide pass/fail feedback
5. Generate attendance/completion reports
6. View employee skill levels

---

## Business Rules

### Rule 1: Trainer Eligibility
```
IF employee has Grade 4 in ALL skills required by their department
THEN employee is eligible to be selected as TRAINER
```

### Rule 2: Employee Training Eligibility
```
IF employee is in selectedAssignTraining for a skill
AND training teaches that skill
AND employee's department needs that skill
THEN employee can be enrolled in training
```

### Rule 3: Skill Grading
```
Grades must progress: 1 → 2 → 3 → 4
Only managers can update grades
Grade 4 requires demonstrated expertise + approval
```

### Rule 4: Training Enrollment
```
Trainer CANNOT enroll in their own training
Employee can be enrolled in multiple trainings
Training can have multiple skills
```

### Rule 5: Department Skill Types
```
Type 1 (Giving Training):
  - Department CAN train others in this skill
  - Department has Grade 4 employees

Type 3 (Applicable to my department):
  - Department NEEDS employees to learn this skill
  - Department tracks progress toward Grade 4
```

### Rule 6: External Trainer Expiry
```
IF trainer_type = 'EXTERNAL'
AND expiry_date < CURRENT_DATE
THEN is_active = 0 (auto-deactivated)
```

---

## Key Queries

### Find All Grade 4 Employees (Potential Trainers)
```sql
SELECT e.employeeId, e.employeeName, s.skillName
FROM employee e
INNER JOIN employeeSkill es ON e.employeeId = es.employeeId
INNER JOIN skill s ON es.skillId = s.skillId
WHERE es.grade = 4
ORDER BY e.employeeName, s.skillName;
```

### Find Employees Who Need Training
```sql
SELECT e.employeeId, e.employeeName, s.skillName, es.grade
FROM selectedAssignTraining sa
INNER JOIN employee e ON sa.employeeId = e.employeeId
INNER JOIN skill s ON sa.skillId = s.skillId
LEFT JOIN employeeSkill es ON sa.employeeId = es.employeeId 
  AND sa.skillId = es.skillId
WHERE es.grade < 4 OR es.grade IS NULL
ORDER BY e.employeeName;
```

### Find Training Programs by Department
```sql
SELECT t.trainingTitle, t.startTrainingDate, t.endTrainingDate,
       e.employeeName AS trainer,
       GROUP_CONCAT(s.skillName) AS skills
FROM training t
INNER JOIN employee e ON t.trainerId = e.employeeId
INNER JOIN trainingSkills ts ON t.trainingId = ts.trainingId
INNER JOIN skill s ON ts.skillId = s.skillId
WHERE s.departmentId = ?
GROUP BY t.trainingId;
```

### Track Employee Training Progress
```sql
SELECT e.employeeName, t.trainingTitle, 
       tr.trainerFeedback,
       COUNT(a.attendanceStatus) AS sessionsAttended,
       (SELECT COUNT(*) FROM sessions WHERE trainingId = t.trainingId) AS totalSessions
FROM trainingRegistration tr
INNER JOIN employee e ON tr.employeeId = e.employeeId
INNER JOIN training t ON tr.trainingId = t.trainingId
LEFT JOIN sessions s ON t.trainingId = s.trainingId
LEFT JOIN attendance a ON s.sessionId = a.sessionId 
  AND a.employeeId = tr.employeeId 
  AND a.attendanceStatus = 1
WHERE tr.employeeId = ?
GROUP BY t.trainingId;
```

---

## Summary

### Training System Flow
1. **Skills** → Defined and categorized
2. **Skill Matrix** → Employees graded 1-4
3. **Grade 4 Achievement** → Employee becomes trainer-eligible
4. **Training Created** → Skills selected, trainer assigned
5. **Employees Enrolled** → Based on selectedAssignTraining
6. **Sessions Conducted** → Attendance tracked
7. **Feedback Provided** → Pass/Fail recorded
8. **Grades Updated** → Skill matrix reflects progress
9. **Cycle Repeats** → Continuous skill development

### The 4-Square Rule
✅ **All department skills at Grade 4 = TRAINER STATUS**

This is the cornerstone of the system - ensuring only truly qualified employees can train others.

---

**Document Version:** 1.0  
**Last Updated:** September 3, 2026  
**Maintained By:** Training Management System Team
