# Quick Fix Guide - RBAC Manager Issue

## Problem
Manager (Tanmay #98) sees "No stages found" for project #445, but History shows 3 stages exist.

## Quick Diagnostic (Run These 3 Queries)

```sql
-- 1. What's the exact project number?
SELECT projectNumber, projectCreatedBy FROM project WHERE projectNumber LIKE '%445%';

-- 2. What are the employee IDs?
SELECT employeeId, customEmployeeId, employeeName FROM employee WHERE customEmployeeId IN ('98', '99');

-- 3. Do stages exist?
SELECT stageId, stageName, projectNumber FROM stage WHERE projectNumber LIKE '%445%' AND historyOf IS NULL;
```

## Most Likely Fixes

### Fix 1: Project Number Mismatch (90% probability)
**If query #1 shows `projectNumber = '445'` but API calls use different format:**

No code change needed - just verify the URL format matches database.

### Fix 2: projectCreatedBy is NULL or Wrong (80% probability)
**If query #1 shows `projectCreatedBy = NULL` or wrong ID:**

```sql
-- Fix it (replace 293 with Tanmay's employeeId from query #2)
UPDATE project 
SET projectCreatedBy = 293
WHERE projectNumber = '445';
```

### Fix 3: Type Mismatch (60% probability)
**If backend logs show different types for IDs:**

Edit `backend/middleware/rbacMiddleware.js` line 91:
```javascript
// Change from:
if (projectData[0].projectCreatedBy === employeeId) {

// To:
if (parseInt(projectData[0].projectCreatedBy) === parseInt(employeeId)) {
```

## How to Apply Fixes

1. **Run diagnostic queries** above
2. **Check results** and identify which fix applies
3. **Apply the fix** (SQL or code change)
4. **Restart backend** if code was changed
5. **Refresh browser** and test

## Verification

After fix, as Manager (Tanmay):
1. Navigate to project 445
2. Should see 3 stages (not "No stages found")
3. Stages should show "Editable" (not "Read Only")

## Backend Logs to Watch

When you navigate to the project, backend console should show:
```
[RBAC] ========== RBAC MIDDLEWARE DEBUG ==========
[RBAC] User ID: 293 (or Tanmay's ID)
[RBAC] Project Number: 445
[RBAC] Project Creator: 293 (should match User ID)
[RBAC] Is Manager?: true (THIS IS THE KEY!)
```

If "Is Manager?" shows `false`, that's the problem.

## Files with Debug Logging

- `backend/middleware/rbacMiddleware.js` - Shows Manager detection
- `backend/controllers/stage.controller.js` - Shows stage filtering

## Need Help?

Share the results of the 3 diagnostic queries above and I'll tell you exactly which fix to apply.

---

**TL;DR:**
1. Run 3 SQL queries
2. Check if `projectCreatedBy` matches Tanmay's `employeeId`  
3. If not, run UPDATE query to fix it
4. Restart backend, test again
