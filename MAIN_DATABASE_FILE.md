# 🎯 MAIN Database File for This Project

## **Answer: There Are TWO Main Files (Use Both)**

### **Option 1: RECOMMENDED - Use Both Files Together**

```
1. aakar_merged.sql (24 KB, 38 tables) - PRIMARY
2. commonDB12.sql (36 KB, 25 tables) - COMPLEMENTARY
```

---

## 📊 **Complete Analysis**

### **File Comparison:**

| File | Tables | Size | Contains | Status |
|------|--------|------|----------|--------|
| **`aakar_merged.sql`** | 38 | 24 KB | HR + Training + **Projects** + BOM + Tickets | ✅ **MOST COMPLETE** |
| `commonDB12.sql` | 25 | 36 KB | HR + Training + Tickets (NO Projects) | ⚠️ Missing Projects |
| `aakar (1).sql` | 18 | 26 KB | Partial schema (phpMyAdmin export) | 📦 Old Backup |
| `aakarerp (1).sql` | 29 | 23 KB | Partial schema (phpMyAdmin export) | 📦 Old Backup |

---

## 🏆 **The Winner: `aakar_merged.sql`**

### **Why This Is The Main File:**

#### **1. Most Complete Schema (38 Tables)**
```
✅ HR & Employee Management (14 tables)
   - employee, department, designation, employeeDesignation

✅ Skills & Training (10 tables)
   - skill, departmentSkill, employeeSkill
   - training, trainingSkills, trainingRegistration
   - sessions, attendance, assignTraining, selectedAssignTraining

✅ PROJECT MANAGEMENT (8 tables) ⭐ UNIQUE TO THIS FILE
   - project, stage, substage, substage_activity
   - activity, substages, stage_template, stage_template_item

✅ BOM & Inventory (4 tables)
   - itemmaster, bomdetails, itemdetails, vendor_master
   - transactions_details

✅ Ticket System (12 tables)
   - ticket, ticket_attachments, ticket_assignee_history
   - ticket_status_history, logs, logs_attachments
   - issue_type, ticket_title, basic_solution
   - permissions, sendmailto
```

#### **2. Only File With Project Management**
- **CRITICAL:** `commonDB12.sql` does NOT have project tables
- If your project uses Projects/Stages/Substages → You MUST use `aakar_merged.sql`

#### **3. Most Recently Updated Logic**
- Contains all features from other files
- Plus additional enhancements

---

## ⚠️ **Problem: Overlapping Tables**

Both files contain some of the same tables:
- employee
- department
- skill
- training
- etc.

### **Solution:**

#### **Option A: Use ONLY `aakar_merged.sql` (RECOMMENDED)**
```bash
# This gives you EVERYTHING
mysql -u root -p aakar < aakar_merged.sql

# Then apply migrations
mysql -u root -p aakar < backend/migrations/001_*.sql
mysql -u root -p aakar < backend/migrations/002_*.sql
mysql -u root -p aakar < backend/migrations/004_*.sql
mysql -u root -p aakar < backend/migrations/005_*.sql
```

**Result:** All 38 tables in one go ✅

#### **Option B: Merge Best of Both (Advanced)**
If `commonDB12.sql` has updated employee/training data:
```bash
# 1. Import base structure from aakar_merged
mysql -u root -p aakar < aakar_merged.sql

# 2. Import ONLY data inserts from commonDB12
#    (manually extract INSERT statements)
```

---

## 🔍 **What's in Each File**

### **`aakar_merged.sql` - THE MAIN FILE**

```sql
-- Header comment shows it's comprehensive:
-- ============================================
-- Aakar ERP — Merged Database Schema
-- Combines ALL tables from both repos:
--   - HR/Employee/Department/Designation
--   - Project Management (project, stage, substage)
--   - Training Management
--   - Ticket Tracking
--   - BOM / Inventory
--   - Stage Templates
-- ============================================
```

**Key Tables Unique to This File:**
- `project` - Main project management ⭐
- `stage` - Project stages ⭐
- `substage` - Stage breakdown ⭐
- `substage_activity` - Activities ⭐
- `stage_template` - Reusable templates ⭐
- `stage_template_item` - Template items ⭐
- `activity` - Activity master ⭐
- `substages` - Substage master ⭐

**Total: 38 tables covering entire ERP system**

---

### **`commonDB12.sql` - Complementary**

```sql
-- Creates commonDB1 database
-- Focuses on: HR, Skills, Training, Tickets
-- Does NOT include: Project Management
```

**Unique Advantage:**
- Contains sample employee data (15 employees)
- Has department seed data
- Good for testing HR/Training modules

**Major Limitation:**
- ❌ Missing project/stage/substage tables
- ❌ Can't handle project management features

**Total: 25 tables (subset of aakar_merged.sql)**

---

## 📁 **Currently Open File: `aakar (1).sql`**

You have this file open in your editor. This is:
- ❌ **NOT the main file**
- 📦 **Old phpMyAdmin export** (Oct 2025)
- 🔙 **Backup/Reference only**
- ⚠️ Only 18 tables (incomplete)

**Don't use this for setup!**

---

## 🎯 **Recommendation for Your Project**

### **Based on Your Project Structure:**

Looking at your open files:
- `.kiro/specs/project-rbac/` - Project RBAC specs
- `backend/scripts/check_project_988.mjs` - Project scripts
- `SubPartComponent.jsx` - Project components

**Your project DEFINITELY uses Project Management!**

### **Therefore, you MUST use:**
```
✅ aakar_merged.sql (PRIMARY FILE)
```

---

## 🚀 **Setup Instructions**

### **Fresh Installation:**

```bash
# Step 1: Backup any existing database
mysqldump -u root -p aakar > backup_$(date +%Y%m%d).sql

# Step 2: Import aakar_merged.sql (MAIN FILE)
mysql -u root -p aakar < aakar_merged.sql

# Step 3: Apply all migrations in order
mysql -u root -p aakar < backend/migrations/001_recursive_substages_and_templates.sql
mysql -u root -p aakar < backend/migrations/002_add_isCompleted_to_substage.sql
mysql -u root -p aakar < backend/migrations/004_create_stage_assignment_table.sql
mysql -u root -p aakar < backend/migrations/005_populate_stage_assignments.sql

# Step 4: (Optional) Add test data
mysql -u root -p aakar < seed_data.sql
```

### **Verification:**

```sql
-- Check all tables exist
USE aakar;
SHOW TABLES;

-- Should see 38+ tables including:
-- - employee, department, designation
-- - skill, training
-- - project, stage, substage ⭐ IMPORTANT
-- - stage_assignment (from migrations)
```

---

## 📊 **Visual Decision Tree**

```
Does your project use Project Management?
│
├─ YES (You have project/stage tables in code)
│   └─ Use: aakar_merged.sql ✅
│       Then: Apply migrations/*.sql
│
└─ NO (Only HR/Training/Skills)
    └─ Use: commonDB12.sql ✅
        Then: Apply migrations/*.sql
```

**Your case:** You have project RBAC specs and project scripts
**Answer:** Use **`aakar_merged.sql`** ✅

---

## 🔑 **Final Answer**

```
MAIN DATABASE FILE: aakar_merged.sql
```

### **Why:**
1. ✅ Most tables (38 vs 25)
2. ✅ Includes ALL features (HR + Training + Projects + BOM + Tickets)
3. ✅ Only file with project management tables
4. ✅ Your project uses projects (based on code analysis)
5. ✅ Most complete and comprehensive

### **Don't Use:**
- ❌ `aakar (1).sql` - Old backup (18 tables)
- ❌ `aakarerp (1).sql` - Old backup (29 tables)
- ⚠️ `commonDB12.sql` - Missing projects (use only if no project mgmt needed)

---

## 📝 **Quick Reference**

```bash
# The ONE command you need:
mysql -u root -p aakar < aakar_merged.sql

# Then apply enhancements:
cd backend/migrations
for file in *.sql; do mysql -u root -p aakar < "$file"; done
```

**Done! You have the complete database.**

---

## ✅ **Summary Table**

| Aspect | Answer |
|--------|--------|
| **Main File** | `aakar_merged.sql` |
| **Size** | 24 KB |
| **Tables** | 38 tables |
| **Use For** | Complete ERP (HR + Training + Projects + BOM + Tickets) |
| **Must Have?** | YES (if using projects) |
| **Complementary** | migrations/*.sql files |

**Bottom Line:** Close `aakar (1).sql` and use `aakar_merged.sql` as your primary database schema file.
