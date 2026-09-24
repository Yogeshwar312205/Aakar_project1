# External Trainer - Cross-Department Skills Fix

## Issue
When adding an external trainer, the skills dropdown only shows skills owned by the admin's department, not cross-department skills that are marked as "Applicable to my department".

## Root Cause
The skills endpoint `/skills/:departmentId` was filtering cross-department skills correctly, but most skills in the database have `skillActivityStatus = 0` (inactive), so they don't appear in the dropdown.

## Solution Applied
Updated the skills query to include ALL types of cross-department skills:
- **Type 1**: Read-only cross-department access
- **Type 2**: Manager-assigned cross-department access  
- **Type 3**: Full access cross-department access

### Updated Query
```javascript
SELECT DISTINCT s.skillId, s.skillName, s.departmentIdGivingTraining, s.skillDescription, s.departmentId
FROM skill s
LEFT JOIN departmentSkill ds ON s.skillId = ds.skillId
WHERE s.skillActivityStatus = 1  -- Only active skills
  AND (
    s.departmentId = ?  -- Skills owned by this department
    OR (ds.departmentId = ? AND ds.departmentSkillType IN (1, 2, 3) AND ds.departmentSkillStatus = 1)  -- Cross-dept skills
  )
ORDER BY s.skillName
```

## Database Status Check Results

### For Finance Department (ID: 3):

**Currently Active Skills (showing in dropdown):**
1. ✅ **DAAA** - Cross-department from CS (Manager Assigned, Active)
2. ✅ **Fintech** - Owned by Finance (Active)

**Inactive Skills (NOT showing, need activation):**
3. ❌ DSA - Cross-department from CS (Inactive)
4. ❌ fintech (lowercase) - From Finance (Inactive, duplicate)
5. ❌ Programming - From Finance (Inactive)
6. ❌ Security - Cross-department from CS (Inactive)
7. ❌ TOC - Cross-department from CS (Inactive, 2 entries)

## How to Activate Skills

To make inactive cross-department skills visible in the Add External Trainer form:

### Option 1: Via SQL (Quick Fix)
```sql
-- Activate specific skills by name
UPDATE skill 
SET skillActivityStatus = 1 
WHERE skillName IN ('DSA', 'Security', 'TOC', 'Programming');

-- OR activate all skills
UPDATE skill 
SET skillActivityStatus = 1;
```

### Option 2: Via Admin UI
1. Login as admin
2. Navigate to Training → Skills (or wherever skill management is)
3. Find the skill (e.g., "Security")
4. Toggle "Activity Status" to Active
5. Save changes

## Verification

After activating skills, test by:

1. **Login as admin** (Yogendra, Finance dept)
2. **Navigate to**: Training → External Trainers → Add External Trainer
3. **Check Skills dropdown** - should now see:
   - Fintech (owned by Finance)
   - DAAA (cross-dept from CS)
   - DSA (cross-dept from CS) ← newly visible
   - Security (cross-dept from CS) ← newly visible
   - TOC (cross-dept from CS) ← newly visible
   - Programming (from Finance) ← newly visible

## Cross-Department Skill Types Explained

| Type | Name | Description | Included? |
|------|------|-------------|-----------|
| 1 | Read-only | Employees can view, no training assignment | ✅ Yes |
| 2 | Manager Assigned | Manager can assign training to employees | ✅ Yes |
| 3 | Full Access | Full access like owned skills | ✅ Yes |

All three types are now included when adding external trainers, giving admins maximum flexibility in assigning skills.

## Files Modified
- **backend/controllers/skills.js** - Updated `/skills/:departmentId` to include types 1, 2, and 3

## Testing Script
Run this to check what skills are available for a department:
```bash
cd backend
node test-department-skills.mjs
```

---

**Fixed:** September 24, 2026  
**Status:** Complete ✅ (Backend fixed, database activation needed)
