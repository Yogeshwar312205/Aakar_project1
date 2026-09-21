# Project Management Schema - Complete Guide

## 🎯 **Main File Containing Project Management Schema**

### **PRIMARY FILE:**
```
aakar_merged.sql (24 KB)
```
**This file contains the MOST COMPLETE project management schema.**

### **Secondary Files:**
```
backend/migrations/001_recursive_substages_and_templates.sql - Stage Templates
backend/migrations/004_create_stage_assignment_table.sql - Stage Assignments (RBAC)
```

---

## 📊 **Project Management Tables Overview**

### **Core Project Tables (in `aakar_merged.sql`)**

#### 1. **`project`** - Main Project Table
```sql
CREATE TABLE IF NOT EXISTS `project` (
  `projectNumber` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `historyOf` int(10) UNSIGNED DEFAULT NULL,  -- Version control
  `progress` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`projectNumber`)
);
```
**Purpose:** Main project information
**Key Fields:**
- `projectNumber` - Unique project ID (PK)
- `companyName` - Client company
- `dieName` / `dieNumber` - Die manufacturing details
- `projectStatus` - Current status
- `historyOf` - Links to previous version (version control)
- `progress` - Overall project completion percentage

---

#### 2. **`stage`** - Project Stages
```sql
CREATE TABLE IF NOT EXISTS `stage` (
  `stageId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `projectNumber` int(10) UNSIGNED NOT NULL,
  `stageName` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `owner` int(10) UNSIGNED DEFAULT NULL,      -- Employee responsible
  `machine` varchar(255) NOT NULL,
  `duration` int(11) NOT NULL,
  `seqPrevStage` int(10) UNSIGNED DEFAULT NULL,  -- Sequential dependency
  `createdBy` int(10) UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `historyOf` int(10) UNSIGNED DEFAULT NULL,
  `updateReason` text DEFAULT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`stageId`),
  FOREIGN KEY (`projectNumber`) REFERENCES `project`(`projectNumber`)
);
```
**Purpose:** Major phases within a project
**Key Fields:**
- `stageId` - Unique stage ID (PK)
- `projectNumber` - Links to project (FK)
- `owner` - Stage owner (employee ID)
- `seqPrevStage` - Previous stage dependency
- `progress` - Stage completion percentage

---

#### 3. **`substage`** - Sub-stages within Stages
```sql
CREATE TABLE IF NOT EXISTS `substage` (
  `substageId` int(11) NOT NULL AUTO_INCREMENT,
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
  `progress` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`substageId`),
  FOREIGN KEY (`stageId`) REFERENCES `stage`(`stageId`),
  FOREIGN KEY (`projectNumber`) REFERENCES `project`(`projectNumber`)
);
```
**Purpose:** Detailed tasks within stages
**Key Fields:**
- `substageId` - Unique substage ID (PK)
- `stageId` - Parent stage (FK)
- `owner` - Substage owner (employee ID)
- `seqPrevStage` - Dependency on previous substage

---

#### 4. **`substage_activity`** - Activities within Substages
```sql
CREATE TABLE IF NOT EXISTS `substage_activity` (
  `activityId` int(11) NOT NULL AUTO_INCREMENT,
  `substageId` int(11) NOT NULL,
  `activityName` varchar(255) NOT NULL,
  `isCompleted` tinyint(1) NOT NULL DEFAULT 0,
  `createdBy` int(10) UNSIGNED NOT NULL,
  `owner` int(10) UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`activityId`),
  FOREIGN KEY (`substageId`) REFERENCES `substage`(`substageId`) ON DELETE CASCADE
);
```
**Purpose:** Smallest work units
**Key Fields:**
- `activityId` - Unique activity ID (PK)
- `substageId` - Parent substage (FK)
- `isCompleted` - Completion status
- `owner` - Activity owner

---

### **Supporting Tables**

#### 5. **`substages`** - Master Substage List
```sql
CREATE TABLE IF NOT EXISTS `substages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
);
```
**Purpose:** Predefined substage names dropdown

---

#### 6. **`activity`** - Master Activity List
```sql
CREATE TABLE IF NOT EXISTS `activity` (
  `activityid` int(11) NOT NULL AUTO_INCREMENT,
  `activity_name` varchar(255) NOT NULL,
  PRIMARY KEY (`activityid`)
);
```
**Purpose:** Predefined activity names dropdown

---

### **Template System (in `aakar_merged.sql` + `migrations/001_*.sql`)**

#### 7. **`stage_template`** - Reusable Stage Templates
```sql
CREATE TABLE IF NOT EXISTS `stage_template` (
  `templateId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateName` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `createdBy` int(10) UNSIGNED DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`templateId`),
  FOREIGN KEY (`createdBy`) REFERENCES `employee`(`employeeId`)
);
```
**Purpose:** Store reusable stage configurations
**Use Case:** Quickly create similar projects

---

#### 8. **`stage_template_item`** - Template Items/Stages
```sql
CREATE TABLE IF NOT EXISTS `stage_template_item` (
  `itemId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `templateId` int(10) UNSIGNED NOT NULL,
  `stageName` varchar(255) NOT NULL,
  `machine` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `orderIndex` int(11) DEFAULT 0,
  `parentItemId` int(10) UNSIGNED DEFAULT NULL,  -- Recursive structure
  PRIMARY KEY (`itemId`),
  FOREIGN KEY (`templateId`) REFERENCES `stage_template`(`templateId`) ON DELETE CASCADE,
  FOREIGN KEY (`parentItemId`) REFERENCES `stage_template_item`(`itemId`) ON DELETE CASCADE
);
```
**Purpose:** Individual stages/substages within templates
**Key Feature:** Supports recursive/nested structures via `parentItemId`

---

### **RBAC System (in `migrations/004_*.sql`)**

#### 9. **`stage_assignment`** - Stage Access Control
```sql
CREATE TABLE IF NOT EXISTS `stage_assignment` (
  `assignmentId` INT(11) NOT NULL AUTO_INCREMENT,
  `projectNumber` INT(11) NOT NULL,
  `stageId` INT(11) DEFAULT NULL,
  `substageId` INT(11) DEFAULT NULL,
  `employeeId` INT(11) NOT NULL,
  `assignedBy` INT(11) DEFAULT NULL,
  `assignedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignmentId`),
  UNIQUE KEY `unique_assignment` (`projectNumber`, `stageId`, `substageId`, `employeeId`),
  KEY `idx_employee` (`employeeId`),
  KEY `idx_project` (`projectNumber`),
  KEY `idx_stage` (`stageId`),
  KEY `idx_substage` (`substageId`)
);
```
**Purpose:** Track which employees have access to which stages/substages
**Use Case:** Role-based access control for project visibility

---

## 📁 **File Locations Summary**

| File | Tables Included | When to Use |
|------|----------------|-------------|
| **`aakar_merged.sql`** | `project`, `stage`, `substage`, `substage_activity`, `activity`, `substages`, `stage_template`, `stage_template_item` | **PRIMARY - Use for base schema** |
| `backend/migrations/001_*.sql` | `stage_template`, `stage_template_item` (enhanced) | After base schema for recursive templates |
| `backend/migrations/002_*.sql` | Adds `isCompleted` to `substage` | After 001 for completion tracking |
| `backend/migrations/004_*.sql` | `stage_assignment` | After base for RBAC feature |
| `backend/migrations/005_*.sql` | Populates `stage_assignment` | After 004 to migrate existing data |

---

## 🗂️ **Project Hierarchy Structure**

```
Project (projectNumber)
├── Stage 1 (stageId)
│   ├── Substage 1.1 (substageId)
│   │   ├── Activity 1.1.1 (activityId)
│   │   ├── Activity 1.1.2
│   │   └── Activity 1.1.3
│   ├── Substage 1.2
│   │   └── Activities...
│   └── Substage 1.3
├── Stage 2
│   ├── Substages...
│   └── Activities...
└── Stage 3
    └── ...
```

---

## 🔗 **Relationships**

```
project (1) ──────< (many) stage
                        │
                        ├──< (many) substage
                        │       │
                        │       └──< (many) substage_activity
                        │
                        └──< (many) stage_assignment
                                    │
                                    └──< (1) employee
```

---

## 🎯 **Key Features**

### **1. Version Control**
- `historyOf` field tracks previous versions
- `updateReason` stores change justification
- Maintains audit trail

### **2. Progress Tracking**
- `progress` field at project, stage, and substage levels
- Enables hierarchical completion percentage

### **3. Sequential Dependencies**
- `seqPrevStage` links stages/substages
- Creates workflow dependencies

### **4. Ownership & Authorization**
- `owner` field assigns responsibility
- `stage_assignment` controls access
- RBAC at stage/substage level

### **5. Reusable Templates**
- `stage_template` stores configurations
- Quick project setup from templates
- Recursive/nested template support

---

## 🚀 **Setup Order**

### **Step 1: Base Schema**
```sql
-- Import main project tables
mysql -u root -p aakar < aakar_merged.sql
```

### **Step 2: Enhanced Templates (Optional)**
```sql
-- Add recursive template support
mysql -u root -p aakar < backend/migrations/001_recursive_substages_and_templates.sql
```

### **Step 3: Completion Tracking (Optional)**
```sql
-- Add isCompleted field
mysql -u root -p aakar < backend/migrations/002_add_isCompleted_to_substage.sql
```

### **Step 4: RBAC System (Recommended)**
```sql
-- Add stage assignment table
mysql -u root -p aakar < backend/migrations/004_create_stage_assignment_table.sql

-- Populate with existing data
mysql -u root -p aakar < backend/migrations/005_populate_stage_assignments.sql
```

---

## 📊 **Table Comparison Across Files**

| Table | aakar_merged.sql | commonDB12.sql | migrations/*.sql |
|-------|-----------------|----------------|------------------|
| `project` | ✅ Complete | ❌ Not included | - |
| `stage` | ✅ Complete | ❌ Not included | - |
| `substage` | ✅ Complete | ❌ Not included | ✅ Enhanced (002) |
| `substage_activity` | ✅ Complete | ❌ Not included | - |
| `activity` | ✅ Complete | ❌ Not included | - |
| `substages` | ✅ Complete | ❌ Not included | - |
| `stage_template` | ✅ Basic | ❌ Not included | ✅ Enhanced (001) |
| `stage_template_item` | ✅ Basic | ❌ Not included | ✅ Enhanced (001) |
| `stage_assignment` | ❌ Not included | ❌ Not included | ✅ New (004) |

---

## ⚠️ **Important Notes**

### **1. commonDB12.sql Does NOT Include Project Tables**
The main `commonDB12.sql` file focuses on:
- HR/Employee management
- Skills & Training
- Departments
- BOM & Inventory

**It does NOT include:**
- Project management tables
- Stage/Substage system
- Activity tracking

### **2. Use aakar_merged.sql for Projects**
If you need project management functionality, you MUST use `aakar_merged.sql` or import both:
```sql
-- Option 1: Use aakar_merged.sql (includes everything)
mysql -u root -p aakar < aakar_merged.sql

-- Option 2: Import commonDB12.sql + project tables separately
mysql -u root -p aakar < commonDB12.sql
mysql -u root -p aakar < aakar_merged.sql  # Only project tables section
```

### **3. Migration Order Matters**
Always apply migrations in numerical order:
1. 001 (templates)
2. 002 (completion tracking)
3. 004 (RBAC)
4. 005 (populate RBAC)

---

## 🔍 **Quick Verification Queries**

### **Check if Project Tables Exist:**
```sql
SHOW TABLES LIKE 'project%';
SHOW TABLES LIKE 'stage%';
SHOW TABLES LIKE 'substage%';
```

### **Count Records:**
```sql
SELECT 
    (SELECT COUNT(*) FROM project) as total_projects,
    (SELECT COUNT(*) FROM stage) as total_stages,
    (SELECT COUNT(*) FROM substage) as total_substages,
    (SELECT COUNT(*) FROM substage_activity) as total_activities;
```

### **Check Template Support:**
```sql
SELECT COUNT(*) FROM stage_template;
SELECT COUNT(*) FROM stage_template_item;
```

### **Check RBAC Support:**
```sql
SELECT COUNT(*) FROM stage_assignment;
```

---

## 📝 **Summary**

✅ **Primary File:** `aakar_merged.sql` (24 KB)
✅ **Contains:** 8 core project tables
✅ **Enhanced By:** 4 migration files
✅ **Total Tables:** 9 (with RBAC)

**Key Tables:**
1. `project` - Main project data
2. `stage` - Project stages
3. `substage` - Stage breakdown
4. `substage_activity` - Task activities
5. `stage_template` - Reusable templates
6. `stage_template_item` - Template contents
7. `stage_assignment` - Access control (RBAC)
8. `activity` - Master activity list
9. `substages` - Master substage list

**NOT in commonDB12.sql** - Must use `aakar_merged.sql` for project management features!
