# RBAC Issue Summary & Fix Plan

## Current Status

### What We See in Screenshots

**Screenshot 3 & 4 (Manager - Tanmay #98):**
- URL: `/myProject/445`
- Project Badge: `#445`
- Project Name: `JT — 5`
- Issue: "Stages (0) No stages found for this project"
- History Tab: Shows "History (3 stages)" - **stages DO exist!**

**Screenshot 1 & 2 (Employee - Yogendra #99):**
- URL: `/myProject/445/myStage/179`
- Shows 4 substages with "🔒 Read Only" badges
- Owner shows: Tanmay, Yogendra (different substages have different owners)
- Issue: Everything shows "Read Only" even for Yogendra's own substages

### Root Causes Identified

#### Issue #1: Manager Cannot See Stages
**Symptom:** Tanmay (Manager) sees "No stages found" but History shows 3 stages exist.

**Possible Causes:**
1. **Project Number Mismatch**: Database has different format than URL
   - URL uses: `445`
   - Database might have: `P445`, `#445`, or `445`
   
2. **projectCreatedBy Field Issue**:
   - Field is NULL
   - Field contains wrong employeeId
   - Type mismatch (string vs number)

3. **RBAC Middleware Failing**:
   - Cannot find projectNumber from route parameter
   - Manager detection failing due to ID mismatch
   - Middleware throwing error before reaching controller

#### Issue #2: Everything Shows "Read Only"
**Symptom:** Even Yogendra's own substages show "Read Only" badge.

**Cause:** Backend `canEdit` flag is being set to `false`. This happens when:
- `rbac.isManager !== true` AND
- Stage/substage ID is NOT in `rbac.ownedStages` / `rbac.ownedSubstages` arrays

**Likely Reason:** 
- The `stage_assignment` table doesn't have records for Yogendra
- OR the substage owners are set wrong in the database
- OR there's a type mismatch in ID comparisons

## Diagnostic Steps

### Step 1: Run SQL Diagnostic Queries

Run the queries in `RBAC_DIAGNOSTIC_QUERIES.sql` to get:
1. Exact project number format
2. Employee IDs for Tanmay and Yogendra
3. Stage and substage ownership
4. Assignment records
5. Manager detection verification

**Critical Queries:**
```sql
-- Check project format and creator
SELECT projectNumber, projectCreatedBy, dieName 
FROM project 
WHERE projectNumber LIKE '%445%';

-- Check employee IDs
SELECT employeeId, customEmployeeId, employeeName 
FROM employee 
WHERE customEmployeeId IN ('98', '99');

-- Check stages
SELECT stageId, stageName, owner, projectNumber 
FROM stage 
WHERE projectNumber LIKE '%445%' 
AND historyOf IS NULL;
```

### Step 2: Check Backend Logs

With the new debug logging, when you:
1. Login as Tanmay
2. Navigate to project 445
3. Open browser DevTools Console
4. Refresh the page

You should see in **backend console**:
```
[RBAC] ========== RBAC MIDDLEWARE DEBUG ==========
[RBAC] User ID: <employeeId>
[RBAC] Project Number: <projectNumber>
[RBAC] Project Creator: <creatorId>
[RBAC] Is Manager?: true/false
[RBAC] ==============================================

[Stage Controller] ========== STAGE QUERY DEBUG ==========
[Stage Controller] RBAC Object: { "isManager": ..., "ownedStages": [...] }
[Stage Controller] ==========================================
```

### Step 3: Check Browser Console

Look for:
- API call URLs (should be `/api/activeStages/445`)
- Error messages
- Network tab showing 401, 403, or 404 responses

## Expected Fixes Based on Findings

### Fix A: Project Number Format Mismatch

**If Query #1 shows projectNumber = 'P445' but URL uses '445':**

Add this to `backend/middleware/rbacMiddleware.js` after line 30:
```javascript
// Normalize project number - try with and without prefix
if (projectNumber && /^\d+$/.test(projectNumber)) {
  // If it's just digits, check both formats
  const [projectCheck] = await connection.promise().query(
    'SELECT projectNumber FROM project WHERE projectNumber IN (?, ?, ?)',
    [projectNumber, `P${projectNumber}`, `#${projectNumber}`]
  )
  if (projectCheck && projectCheck.length > 0) {
    projectNumber = projectCheck[0].projectNumber
  }
}
```

### Fix B: projectCreatedBy is NULL

**If Query #5 shows projectCreatedBy = NULL:**

```sql
-- Update project creator (replace 293 with Tanmay's actual employeeId)
UPDATE project 
SET projectCreatedBy = (SELECT employeeId FROM employee WHERE customEmployeeId = '98')
WHERE projectNumber = '445' 
AND projectCreatedBy IS NULL;
```

### Fix C: Type Mismatch (String vs Number)

**If logs show different types for projectCreatedBy and employeeId:**

Change line 91 in `backend/middleware/rbacMiddleware.js`:
```javascript
// From:
if (projectData[0].projectCreatedBy === employeeId) {

// To:
if (parseInt(projectData[0].projectCreatedBy) === parseInt(employeeId)) {
```

### Fix D: Missing stage_assignment Records for Employees

**If Query #4 shows no assignments for Yogendra:**

Either:
1. **Option A:** Create assignments manually:
```sql
-- Assign Yogendra to stages/substages they own
INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy, assignedDate)
SELECT DISTINCT 
    s.projectNumber,
    s.stageId,
    NULL,
    s.owner,
    (SELECT projectCreatedBy FROM project WHERE projectNumber = s.projectNumber),
    NOW()
FROM stage s
WHERE s.projectNumber = '445'
AND s.owner = (SELECT employeeId FROM employee WHERE customEmployeeId = '99')
AND s.historyOf IS NULL;

-- Same for substages
INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy, assignedDate)
SELECT DISTINCT 
    ss.projectNumber,
    NULL,
    ss.substageId,
    ss.owner,
    (SELECT projectCreatedBy FROM project WHERE projectNumber = ss.projectNumber),
    NOW()
FROM substage ss
WHERE ss.projectNumber = '445'
AND ss.owner = (SELECT employeeId FROM employee WHERE customEmployeeId = '99')
AND ss.historyOf IS NULL;
```

2. **Option B:** Fix the backend to auto-create assignments when stages/substages are created/updated

### Fix E: Owner Field Mismatch

**If Query #8 shows substages owned by wrong person:**

```sql
-- Check current ownership
SELECT substageId, substageName, owner, projectNumber 
FROM substage 
WHERE projectNumber = '445' 
AND historyOf IS NULL;

-- Update if needed (example: set substage 179 owner to Yogendra)
UPDATE substage 
SET owner = (SELECT employeeId FROM employee WHERE customEmployeeId = '99')
WHERE substageId = 179;
```

## Testing Checklist After Fixes

### Manager (Tanmay) Tests
- [ ] Login as Tanmay
- [ ] Navigate to project 445
- [ ] Verify sees all 3 stages (not "No stages found")
- [ ] Verify stages show **"Editable"** (not "Read Only")
- [ ] Click on a stage
- [ ] Verify can see all substages
- [ ] Verify can edit stage name/dates
- [ ] Verify can create new stages

### Employee (Yogendra) Tests
- [ ] Login as Yogendra
- [ ] Navigate to project 445
- [ ] Should see ONLY assigned stages (not all 3)
- [ ] Click on assigned stage
- [ ] Should see ONLY assigned substages
- [ ] Assigned substages should show **"Editable"** (not "Read Only")
- [ ] Unassigned substages should be hidden (not visible at all)
- [ ] Verify can edit assigned substages
- [ ] Verify completion checkbox works for own substages

## Next Actions

1. **IMMEDIATE**: Run diagnostic SQL queries and share results
2. **THEN**: Check backend console logs when navigating to project
3. **BASED ON RESULTS**: Apply appropriate fix (A, B, C, D, or E)
4. **VERIFY**: Run testing checklist

## Files Modified (Debug Logging Added)

1. `backend/middleware/rbacMiddleware.js` - Lines 88-97 (Manager detection debug)
2. `backend/controllers/stage.controller.js` - Lines 58-64, 95-97, 159-174, 250-266 (Stage query debug)

## Files to Check

1. `backend/routes/stage.routes.js` - Verify rbacMiddleware is on routes
2. `backend/controllers/stage.controller.js` - getSingleStageByStageId, getActiveStagesByProjectNumber
3. `backend/middleware/rbacMiddleware.js` - Manager detection logic
4. Database tables: `project`, `stage`, `substage`, `stage_assignment`, `employee`

---

**Priority:** CRITICAL
**Blocking:** Manager cannot use the system
**Estimated Fix Time:** 10-20 minutes once diagnostic results are available
