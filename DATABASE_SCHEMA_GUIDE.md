# Database Schema Files - Complete Guide

## 📁 All Database Schema Files in This Project

### **Root Directory SQL Files**

| File Name | Size | Purpose | Status | Use This? |
|-----------|------|---------|--------|-----------|
| **`commonDB12.sql`** | 36 KB | **MAIN SCHEMA** - Complete database with all tables + sample data | ✅ CURRENT | **YES - PRIMARY** |
| `aakar_merged.sql` | 24 KB | Merged schema from multiple sources | ⚠️ BACKUP | Alternative |
| `aakar (1).sql` | 26 KB | phpMyAdmin export (Oct 2025) | 📦 EXPORT | Reference only |
| `aakarerp (1).sql` | 23 KB | phpMyAdmin export (Aug 2025) | 📦 EXPORT | Reference only |
| `seed_data.sql` | 1 KB | Sample/test data inserts only | 🌱 SEED | For testing |
| `RBAC_DIAGNOSTIC_QUERIES.sql` | 5 KB | Diagnostic queries for RBAC debugging | 🔍 UTILS | For debugging |

### **Backend Directory SQL Files**

| File Name | Size | Purpose | Status |
|-----------|------|---------|--------|
| `backend/bom_migration.sql` | - | BOM (Bill of Materials) table migrations | 🔄 MIGRATION |
| `backend/migrations/001_recursive_substages_and_templates.sql` | - | Substage template system | 🔄 MIGRATION |
| `backend/migrations/002_add_isCompleted_to_substage.sql` | - | Add completion tracking | 🔄 MIGRATION |
| `backend/migrations/004_create_stage_assignment_table.sql` | - | Stage assignment tracking | 🔄 MIGRATION |
| `backend/migrations/005_populate_stage_assignments.sql` | - | Populate stage assignments | 🔄 MIGRATION |
| `backend/uploads/1737884175608.sql` | - | User-uploaded SQL dump | 📤 UPLOAD |

---

## 🎯 How to Identify Which File to Use

### **Primary Schema File (Use This First)**
```
commonDB12.sql
```
**Indicators:**
- ✅ Largest file size (36 KB)
- ✅ Most recent modifications (July 2026)
- ✅ Contains CREATE TABLE statements
- ✅ Contains sample INSERT data
- ✅ Has all core tables: employee, department, skill, training, project, etc.

### **When to Use Each File**

#### 1. **Setting Up Fresh Database → `commonDB12.sql`**
```sql
-- Run this to create the entire database from scratch
mysql -u root -p < commonDB12.sql
```

#### 2. **Adding Test Data → `seed_data.sql`**
```sql
-- Run this AFTER commonDB12.sql to add test departments and employees
mysql -u root -p aakar < seed_data.sql
```

#### 3. **Applying New Features → `backend/migrations/*.sql`**
```sql
-- Run these in order after the base schema
mysql -u root -p aakar < backend/migrations/001_recursive_substages_and_templates.sql
mysql -u root -p aakar < backend/migrations/002_add_isCompleted_to_substage.sql
mysql -u root -p aakar < backend/migrations/004_create_stage_assignment_table.sql
mysql -u root -p aakar < backend/migrations/005_populate_stage_assignments.sql
```

#### 4. **Reference Only (Don't Import)**
- `aakar (1).sql` - Old phpMyAdmin export
- `aakarerp (1).sql` - Old phpMyAdmin export
- These are backups/snapshots, not for active use

---

## 📋 Complete Table List in `commonDB12.sql`

### **Core HR & Employee Management**
1. `employee` - Employee master data
2. `employeeDesignation` - Employee-Department-Designation mapping
3. `department` - Department master
4. `designation` - Designation/Role master

### **Skills & Training Management**
5. `skill` - Skills master
6. `departmentSkill` - Department-Skill relationships (type 1/2/3)
7. `employeeSkill` - Employee skill proficiency with grades
8. `training` - Training sessions
9. `trainingSkills` - Training-Skill mapping
10. `trainingRegistration` - Employee training enrollment
11. `selectedAssignTraining` - Training assignment tracking
12. `sessions` - Training session details
13. `attendance` - Training attendance

### **Project Management**
14. `project` - Projects master
15. `projectAccess` - Project access control (RBAC)
16. `stage` - Project stages
17. `stageTemplate` - Reusable stage templates
18. `substage` - Substages within stages
19. `substagesMaster` - Master substage definitions
20. `activity` - Project activities/tasks
21. `stageAssignment` - Employee-Stage assignments

### **BOM & Inventory**
22. `bom` - Bill of Materials
23. `bomDetails` - BOM line items
24. `bomMaster` - BOM master data
25. `inventory` - Inventory tracking
26. `transactions` - Inventory transactions

### **Ticket Management**
27. `issue_type` - Issue categories
28. `basic_solution` - Predefined solutions
29. `ticketRecords` - Support tickets
30. `ticketClosedRecords` - Closed tickets

### **System & Audit**
31. `logs` - System audit logs

---

## 🔍 How to Identify Files

### **1. By File Headers**

**Schema Files (CREATE statements):**
```sql
-- Look for these patterns at the top
DROP TABLE IF EXISTS `tablename`;
CREATE TABLE IF NOT EXISTS `tablename` (
  ...
);
```

**phpMyAdmin Exports:**
```sql
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- Generation Time: Oct 11, 2025
```

**Migration Files:**
```sql
-- Migration: 001_recursive_substages_and_templates
-- Description: Adds support for recursive substages
```

**Seed Data Files:**
```sql
USE aakar;
INSERT IGNORE INTO department ...
INSERT IGNORE INTO designation ...
```

### **2. By File Size**
- **Large (20-40 KB)** = Complete schema + data (commonDB12.sql, aakar_merged.sql)
- **Medium (5-15 KB)** = Partial schema or migrations
- **Small (< 5 KB)** = Seed data, utilities, or single-table scripts

### **3. By Last Modified Date**
- **Most recent** = Likely the active schema file
- Check with: `Get-ChildItem *.sql | Sort-Object LastWriteTime -Descending`

### **4. By Content Analysis**
```bash
# Count CREATE TABLE statements
Select-String -Path "*.sql" -Pattern "CREATE TABLE" | Group-Object Path | Sort-Object Count -Descending
```

---

## 🚀 Recommended Setup Order

### **Fresh Installation:**
```sql
-- Step 1: Create and populate base schema
mysql -u root -p < commonDB12.sql

-- Step 2: Apply migrations (in order)
mysql -u root -p aakar < backend/migrations/001_recursive_substages_and_templates.sql
mysql -u root -p aakar < backend/migrations/002_add_isCompleted_to_substage.sql
mysql -u root -p aakar < backend/migrations/004_create_stage_assignment_table.sql
mysql -u root -p aakar < backend/migrations/005_populate_stage_assignments.sql

-- Step 3: (Optional) Add test data
mysql -u root -p aakar < seed_data.sql
```

### **Development/Testing:**
```sql
-- Use commonDB12.sql as your baseline
-- It already has sample employees and basic data
mysql -u root -p < commonDB12.sql
```

### **Backup Current Database:**
```bash
# Export current state
mysqldump -u root -p aakar > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📊 Quick Reference: Database Name

**Database Name:** `aakar` or `commonDB1`
- Most files use `aakar`
- `commonDB12.sql` initially creates `commonDB1` but you should modify it to use `aakar`

**To Change Database Name in commonDB12.sql:**
```sql
-- Edit the first lines:
-- FROM:
CREATE DATABASE commonDB1;
USE commonDB1;

-- TO:
CREATE DATABASE IF NOT EXISTS aakar;
USE aakar;
```

---

## 🛠️ Verification Commands

### **Check Which Tables Exist:**
```sql
USE aakar;
SHOW TABLES;
```

### **Count Records in Each Table:**
```sql
SELECT 
    TABLE_NAME, 
    TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'aakar' 
ORDER BY TABLE_ROWS DESC;
```

### **Find Missing Tables:**
Compare the table list in `commonDB12.sql` with your actual database:
```sql
-- In your database
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'aakar';
```

---

## ⚠️ Important Notes

1. **Don't Mix Multiple Schema Files**
   - Choose ONE primary file (recommended: `commonDB12.sql`)
   - Use migrations for updates, not other full schemas

2. **Check Database Name**
   - `commonDB12.sql` uses `commonDB1`
   - Your app likely uses `aakar`
   - Update the schema file or change your `.env` config

3. **Backup Before Importing**
   - Always backup before running ANY SQL file
   - Especially before migration scripts

4. **Migration Files Are Incremental**
   - Don't run them twice
   - They build on the base schema
   - Apply them in numerical order

5. **phpMyAdmin Exports Are Snapshots**
   - `aakar (1).sql` and `aakarerp (1).sql` are point-in-time exports
   - Good for reference, not for active development
   - May be outdated compared to `commonDB12.sql`

---

## 🎯 Summary

**For New Setup:**
→ Use `commonDB12.sql`

**For Updates:**
→ Use files in `backend/migrations/`

**For Testing:**
→ Use `seed_data.sql` after base schema

**For Reference:**
→ Check `aakar_merged.sql` or phpMyAdmin exports

**For Debugging:**
→ Use `RBAC_DIAGNOSTIC_QUERIES.sql`

---

## 📞 Quick Decision Tree

```
Need to set up database?
├─ YES → Use commonDB12.sql
│
Need to add test data?
├─ YES → Use seed_data.sql
│
Need new features (substages, BOM, etc.)?
├─ YES → Use backend/migrations/*.sql (in order)
│
Need to debug RBAC issues?
├─ YES → Use RBAC_DIAGNOSTIC_QUERIES.sql
│
Need to reference old structure?
└─ YES → Check aakar (1).sql or aakarerp (1).sql
```

---

**Current Project Status:**
- ✅ Primary Schema: `commonDB12.sql` (36 KB, July 2026)
- ✅ Migrations: 5 files in `backend/migrations/`
- ✅ Seed Data: `seed_data.sql` available
- ✅ Backups: Multiple phpMyAdmin exports available
