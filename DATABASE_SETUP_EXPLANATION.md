# How Database Files Work Together - Complete Explanation

## 🎯 **Key Concept: ONE Database, Multiple SQL Files**

### **Important Understanding:**
These SQL files are **NOT separate databases**. They are **schema definition files** that all create tables in the **SAME database**.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         ONE Database: "aakar"                   │
│         (in phpMyAdmin/MySQL)                   │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │  Tables from commonDB12.sql:             │ │
│  │  - employee                               │ │
│  │  - department                             │ │
│  │  - skill                                  │ │
│  │  - training                               │ │
│  │  - bom, inventory, etc.                   │ │
│  │                                           │ │
│  ├───────────────────────────────────────────┤ │
│  │                                           │ │
│  │  Tables from aakar_merged.sql:           │ │
│  │  - project                                │ │
│  │  - stage                                  │ │
│  │  - substage                               │ │
│  │  - substage_activity                      │ │
│  │  - stage_template                         │ │
│  │                                           │ │
│  ├───────────────────────────────────────────┤ │
│  │                                           │ │
│  │  Tables from migrations/*.sql:           │ │
│  │  - stage_assignment (RBAC)                │ │
│  │  - Additional columns/features            │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│         All tables exist in ONE database!       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📁 **SQL Files Are NOT Databases - They Are Scripts**

### **What SQL Files Actually Are:**
1. **Schema Definitions** - Instructions to CREATE tables
2. **Data Inserts** - Sample/initial data
3. **Scripts** - Run once to set up structure

### **What SQL Files Are NOT:**
❌ Separate databases
❌ Files that stay "linked" after import
❌ Files that auto-update when data changes

---

## 🔄 **How They Work Together**

### **Step 1: You Import SQL Files (One-Time Setup)**

```sql
-- Import Option 1: Import commonDB12.sql first
mysql -u root -p aakar < commonDB12.sql

-- This creates:
-- - employee, department, skill, training tables
-- - BOM, inventory tables
-- - Basic data (employees, departments, etc.)
```

```sql
-- Import Option 2: Then import aakar_merged.sql
mysql -u root -p aakar < aakar_merged.sql

-- This creates:
-- - project, stage, substage tables
-- - Template tables
-- - Activity tables
-- (Note: May also recreate some tables from commonDB12)
```

```sql
-- Import Option 3: Apply migrations
mysql -u root -p aakar < backend/migrations/001_*.sql
mysql -u root -p aakar < backend/migrations/004_*.sql

-- This adds:
-- - Enhanced features
-- - New columns
-- - New tables (stage_assignment)
```

### **Step 2: After Import - Files Are No Longer Connected**

**Important:**
- Once imported, the SQL files are **NOT linked** to the database
- The tables now exist **independently** in MySQL
- Changes to SQL files **DO NOT** affect the database
- Changes in phpMyAdmin **DO NOT** affect SQL files

```
SQL Files (on disk)          MySQL Database (in phpMyAdmin)
─────────────────            ──────────────────────────────
commonDB12.sql     ──┐       
                     │       ┌───────────────┐
aakar_merged.sql   ──┤───>   │  aakar (DB)   │
                     │       │               │
migrations/*.sql   ──┘       │ - employee    │
                             │ - project     │
    ONE-TIME                 │ - stage       │
    IMPORT                   │ - All tables  │
    ↓                        └───────────────┘
                                    ↓
    Files disconnected      Lives independently
    after import            in MySQL server
```

---

## 🔗 **How Tables Are "Linked" (Foreign Keys)**

The tables are connected through **FOREIGN KEY relationships**, NOT through files:

### **Example Linkage:**

```sql
-- Employee table (from commonDB12.sql)
CREATE TABLE employee (
  employeeId INT PRIMARY KEY,
  employeeName VARCHAR(100)
);

-- Stage table (from aakar_merged.sql)
CREATE TABLE stage (
  stageId INT PRIMARY KEY,
  owner INT,  -- Links to employee
  FOREIGN KEY (owner) REFERENCES employee(employeeId)
);
```

**This means:**
- `stage.owner` references `employee.employeeId`
- Even though they came from different SQL files
- They are connected in the **same database**

---

## 🎯 **Current Setup (Based on .env File)**

```
Database Name: aakar
Database Host: localhost
Database Port: 3306
Database User: root
```

### **What's Actually Happening:**

1. **Your backend connects to ONE database called "aakar"**
   ```javascript
   // backend/db/index.js connects to:
   DB_NAME=aakar
   ```

2. **All tables exist in this ONE database**
   - Employee tables (from commonDB12.sql)
   - Project tables (from aakar_merged.sql)
   - Everything lives together

3. **SQL files are just the "blueprints"**
   - Used once during setup
   - Not used during runtime
   - Backend queries the actual MySQL database

---

## 📊 **How Updates Work**

### **Option 1: Direct Database Updates (Normal Operation)**

```
Frontend/Backend Application
        ↓
    API Calls
        ↓
Backend Controllers
        ↓
MySQL Queries (INSERT, UPDATE, DELETE)
        ↓
MySQL Database (aakar)
        ↓
phpMyAdmin (view changes)
```

**SQL files are NOT involved in this process!**

### **Option 2: SQL File Updates (Development/Migration)**

If you modify SQL files and want to apply changes:

```bash
# 1. Export current database first (BACKUP!)
mysqldump -u root -p aakar > backup_before_update.sql

# 2. Apply new SQL file
mysql -u root -p aakar < updated_schema.sql

# OR use migrations for incremental changes
mysql -u root -p aakar < new_migration.sql
```

---

## 🔄 **phpMyAdmin Updates**

### **When You Change Data in phpMyAdmin:**

1. **Changes go directly to MySQL database**
   ```
   phpMyAdmin → MySQL Server → aakar database → Tables updated
   ```

2. **Your application sees the changes immediately**
   ```
   Backend queries → MySQL → Gets updated data
   ```

3. **SQL files remain unchanged**
   ```
   commonDB12.sql (on disk) - still has old data
   aakar database (in MySQL) - has new data
   ```

### **How to Capture phpMyAdmin Changes:**

```sql
-- Export current database state
mysqldump -u root -p aakar > aakar_updated_$(date +%Y%m%d).sql

-- This creates a NEW SQL file with current state
-- Original SQL files remain unchanged
```

---

## 🎯 **Best Practices**

### **1. Initial Setup (One-Time)**

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS aakar;
USE aakar;

-- Import base schema
SOURCE commonDB12.sql;

-- Import project tables (if needed)
SOURCE aakar_merged.sql;

-- Apply migrations in order
SOURCE backend/migrations/001_recursive_substages_and_templates.sql;
SOURCE backend/migrations/002_add_isCompleted_to_substage.sql;
SOURCE backend/migrations/004_create_stage_assignment_table.sql;
SOURCE backend/migrations/005_populate_stage_assignments.sql;
```

### **2. Development Workflow**

```
Development Changes:
├─ Schema changes → Create new migration file
├─ Data changes → Use backend API or phpMyAdmin
└─ Always backup before major changes
```

### **3. Version Control**

```
Git Repository:
├─ SQL files (schema definitions) ✅ Commit
├─ Migration files ✅ Commit
├─ Database backups ❌ Don't commit (too large)
└─ Use .gitignore for *.sql backups
```

---

## 🔍 **Common Misconceptions**

### **Misconception 1: "Two files = Two databases"**
❌ **Wrong:** All tables exist in ONE database (`aakar`)
✅ **Correct:** Multiple SQL files can define tables for the same database

### **Misconception 2: "SQL files update automatically"**
❌ **Wrong:** SQL files don't change when database changes
✅ **Correct:** SQL files are import scripts, not live connections

### **Misconception 3: "Need both files running"**
❌ **Wrong:** SQL files don't "run" continuously
✅ **Correct:** Import once, then files are disconnected

### **Misconception 4: "phpMyAdmin changes go to SQL files"**
❌ **Wrong:** Changes in phpMyAdmin only affect MySQL database
✅ **Correct:** Must export to create updated SQL file

---

## 📋 **Verification Commands**

### **Check Which Database Your App Uses:**
```bash
# Check .env file
cat backend/.env | grep DB_NAME
# Output: DB_NAME=aakar
```

### **Check All Tables in Your Database:**
```sql
USE aakar;
SHOW TABLES;

-- Output will show ALL tables:
-- - employee (from commonDB12.sql)
-- - project (from aakar_merged.sql)
-- - stage_assignment (from migrations)
-- All in the SAME database!
```

### **Check Foreign Key Relationships:**
```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'aakar'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- This shows how tables are linked together
```

---

## 🚀 **Practical Example**

### **Scenario: Adding a New Employee and Assigning to Project**

```javascript
// 1. Backend API call to add employee
POST /addEmployee
{
  employeeName: "John Doe",
  employeeEmail: "john@example.com"
}

// 2. This runs SQL:
INSERT INTO employee (employeeName, employeeEmail) VALUES (?, ?);

// 3. Employee inserted into aakar.employee table

// 4. Assign employee to a project stage
POST /stage/assign
{
  stageId: 10,
  employeeId: 50  // John's new ID
}

// 5. This runs SQL:
UPDATE stage SET owner = 50 WHERE stageId = 10;

// 6. Updates aakar.stage table
// 7. Links employee (from commonDB12 tables) to stage (from aakar_merged tables)
```

**Key Point:** 
- Employee table came from `commonDB12.sql`
- Stage table came from `aakar_merged.sql`
- They work together because they're in the **SAME database**
- SQL files are NOT involved in this process

---

## 📊 **Visual Summary**

```
┌─────────────────────────────────────────────────────────┐
│                     DEVELOPMENT                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SQL Files (Version Controlled)                         │
│  ├─ commonDB12.sql                                      │
│  ├─ aakar_merged.sql                                    │
│  └─ migrations/*.sql                                    │
│                                                         │
│               ↓ (Import Once)                           │
│                                                         │
│  MySQL Database: aakar                                  │
│  ├─ All tables from all SQL files                      │
│  ├─ Foreign keys linking tables                        │
│  └─ Live data (updated by application)                 │
│                                                         │
│               ↓ (Connected To)                          │
│                                                         │
│  Backend Application                                    │
│  ├─ Reads from MySQL                                   │
│  ├─ Writes to MySQL                                    │
│  └─ Uses foreign keys for joins                        │
│                                                         │
│               ↓ (Serves)                                │
│                                                         │
│  Frontend Application                                   │
│  └─ Displays combined data from all tables             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ **TL;DR - Quick Summary**

1. **One Database:** All tables exist in the `aakar` database
2. **SQL Files:** Just import scripts, not live connections
3. **Import Once:** Run SQL files during initial setup
4. **After Import:** Files and database are disconnected
5. **Updates:** Go directly to MySQL via backend or phpMyAdmin
6. **Foreign Keys:** Link tables together (not files)
7. **phpMyAdmin:** Shows live database, not SQL files
8. **Backups:** Export database to create new SQL files

**Bottom Line:** 
Multiple SQL files → Import → ONE database → All tables together → Backend uses them as one system

The SQL files are like **blueprints** used to build a house. Once the house (database) is built, you live in the house, not the blueprints!
