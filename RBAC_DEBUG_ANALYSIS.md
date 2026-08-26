# RBAC Debug Analysis - Manager "No Stages Found" Issue

## Problem Summary
- **Manager sees:** "Stages (0) No stages found for this project" + "🔒 Read Only" badges
- **History shows:** 3 stages exist
- **Expected:** Manager should see ALL stages with full edit access

## Root Cause Analysis

### Investigation Results

#### 1. RBAC Middleware Logic ✅ CORRECT
Location: `backend/middleware/rbacMiddleware.js` (lines 75-103)

```javascript
// Step 1: Check if user is project creator FIRST
if (projectData[0].projectCreatedBy === employeeId) {
  console.log('[RBAC] User is Manager (project creator)')
  req.rbac = {
    role: 'manager',
    ownedStages: [],  // Empty - Manager has access to ALL
    ownedSubstages: [],
    isManager: true,
    projectNumber: projectNumber
  }
  return next()  // Returns immediately - NEVER checks stage_assignment
}
```

**Status:** ✅ Logic is correct. Manager detection happens BEFORE checking assignments.

#### 2. Stage Controller Filtering Logic ⚠️ POTENTIAL ISSUE
Location: `backend/controllers/stage.controller.js` (lines 77-91)

```javascript
// Apply RBAC filtering: ONLY if user is not a Manager
if (rbac.isManager === false) {  // ⚠️ EXPLICIT false check
  if (rbac.ownedStages && rbac.ownedStages.length > 0) {
    query += ` AND s.stageId IN (?)`
    queryParams.push(rbac.ownedStages)
  } else {
    query += ` AND 1 = 0`  // Return nothing
  }
} else if (rbac.isManager === true) {  // ✅ Manager bypass
  console.log('[Stage Controller] Manager - No filtering, returning all stages')
}
```

**Status:** ✅ Logic appears correct BUT needs runtime verification

#### 3. Stage `canEdit` Flag Logic ⚠️ POTENTIAL ISSUE
Location: `backend/controllers/stage.controller.js` (line 131)

```javascript
const canEdit = rbac.isManager === true || (rbac.ownedStages && rbac.ownedStages.includes(stage.stageId))
```

**Status:** ✅ Should work correctly - Manager check comes first

#### 4. Frontend Read-Only Detection ✅ CORRECT
Location: `frontend/src/utils/rbacUtils.js` (line 274)

```javascript
export const isReadOnly = (item) => {
  if (!item) return true;
  return item.canEdit !== true;  // Uses backend canEdit flag
}
```

**Status:** ✅ Correctly reads backend flag

#### 5. Migration Script Impact ❌ PROBLEMATIC
Location: `backend/migrations/005_populate_stage_assignments.sql`

The migration script creates `stage_assignment` records for ALL stages/substages and assigns them to Managers.

**However:** The middleware checks `projectCreatedBy` BEFORE `stage_assignment`, so this should NOT affect Manager detection.

**Actual Impact:** These assignment records are unnecessary for Managers and create data clutter, but should not break functionality.

## Hypothesis: The Real Issue

After analyzing the code, there are several possible causes:

### Hypothesis 1: `projectCreatedBy` Field is NULL or Incorrect
**Problem:** If `project.projectCreatedBy` doesn't match the logged-in user's `employeeId`, the middleware won't detect Manager status.

**Test:**
```sql
SELECT projectNumber, projectCreatedBy FROM project WHERE projectNumber = 'P24345';
SELECT employeeId, customEmployeeId FROM employee WHERE customEmployeeId = '98';
```

**Fix:** Ensure `projectCreatedBy` contains the correct `employeeId` (not `customEmployeeId`)

### Hypothesis 2: Route Parameter Detection Failure
**Problem:** The middleware can't extract `projectNumber` from the route, so it throws an error or fails silently.

**Location:** `backend/middleware/rbacMiddleware.js` (lines 30-67)

The middleware tries multiple fallback strategies to find `projectNumber`:
1. `req.params.projectNumber`
2. `req.body.projectNumber`
3. `req.params.id` (could be projectNumber, stageId, or substageId)

For the route `GET /api/activeStages/:id`, it uses `req.params.id` and needs to determine if it's a projectNumber.

**Test:** Check console logs for `[RBAC] Checking access for: { employeeId, projectNumber }`

**Fix:** Ensure the route passes the correct parameter and the middleware correctly identifies it

### Hypothesis 3: RBAC Middleware Not Applied to Route
**Problem:** The route doesn't use `rbacMiddleware`, so `req.rbac` is undefined.

**Test:**
```javascript
// In stage.controller.js
console.log('[Stage Controller] req.rbac:', JSON.stringify(req.rbac))
```

**Fix:** Verify `backend/routes/stage.routes.js` includes `rbacMiddleware` on the route

### Hypothesis 4: Frontend API Call Uses Wrong Project Number
**Problem:** Frontend passes incorrect or undefined projectNumber in the API call.

**Test:** Check browser DevTools Network tab for the actual API request URL

**Fix:** Verify `MyProject.jsx` calls `fetchActiveStagesByProjectNumber(pNo)` with correct `pNo`

## Diagnostic Plan

### Step 1: Add Enhanced Logging
Add detailed logs to trace the exact flow:

```javascript
// In rbacMiddleware.js (after line 88)
console.log('[RBAC] ========== RBAC MIDDLEWARE DEBUG ==========')
console.log('[RBAC] User ID:', employeeId)
console.log('[RBAC] Project Number:', projectNumber)
console.log('[RBAC] Project Creator:', projectData[0]?.projectCreatedBy)
console.log('[RBAC] Is Manager?:', projectData[0]?.projectCreatedBy === employeeId)
console.log('[RBAC] ==============================================')

// In stage.controller.js getActiveStagesByProjectNumber (after line 62)
console.log('[Stage Controller] ========== STAGE QUERY DEBUG ==========')
console.log('[Stage Controller] Project Number:', pNo)
console.log('[Stage Controller] RBAC Object:', JSON.stringify(rbac, null, 2))
console.log('[Stage Controller] Query:', query)
console.log('[Stage Controller] Query Params:', queryParams)
console.log('[Stage Controller] ==========================================')

// After query execution (after line 102)
console.log('[Stage Controller] ========== RESULTS ==========')
console.log('[Stage Controller] Stages found:', data.length)
console.log('[Stage Controller] Stages:', data.map(s => ({ stageId: s.stageId, stageName: s.stageName, canEdit: undefined })))
console.log('[Stage Controller] =================================')

// After canEdit calculation (after line 131)
console.log('[Stage Controller] Stage', stage.stageId, 'canEdit:', canEdit, 'isManager:', rbac.isManager)
```

### Step 2: Verify Database State
```sql
-- Check project creator
SELECT projectNumber, projectCreatedBy, companyName 
FROM project 
WHERE projectNumber = 'P24345';

-- Check stages
SELECT stageId, stageName, owner, projectNumber, historyOf 
FROM stage 
WHERE projectNumber = 'P24345' 
AND historyOf IS NULL;

-- Check if Manager has unnecessary assignments
SELECT * 
FROM stage_assignment 
WHERE projectNumber = 'P24345' 
AND employeeId = (SELECT projectCreatedBy FROM project WHERE projectNumber = 'P24345');

-- Check user credentials
SELECT employeeId, customEmployeeId, employeeName 
FROM employee 
WHERE customEmployeeId IN ('98', '99');
```

### Step 3: Test API Endpoint Directly
```bash
# Replace with actual auth token
curl -X GET "http://localhost:3000/api/activeStages/P24345" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### Step 4: Check Frontend State
Add logs in `MyProject.jsx`:
```javascript
// After useEffect that fetches stages
useEffect(() => {
  console.log('[MyProject] activeStages:', activeStages)
  console.log('[MyProject] activeStages.length:', activeStages.length)
  console.log('[MyProject] project:', project)
  console.log('[MyProject] user:', user)
}, [activeStages, project, user])
```

## Recommended Fixes

### Fix 1: Ensure Correct projectCreatedBy Values
```sql
-- If projectCreatedBy is NULL or wrong, update it
UPDATE project 
SET projectCreatedBy = (SELECT employeeId FROM employee WHERE customEmployeeId = '98')
WHERE projectNumber = 'P24345' 
AND (projectCreatedBy IS NULL OR projectCreatedBy != (SELECT employeeId FROM employee WHERE customEmployeeId = '98'));
```

### Fix 2: Remove Unnecessary Manager Assignments (Optional)
The Manager doesn't need `stage_assignment` records since they have full access via `projectCreatedBy`.

```sql
-- Remove Manager's stage_assignment records
DELETE FROM stage_assignment 
WHERE employeeId IN (
  SELECT projectCreatedBy 
  FROM project 
  WHERE projectNumber = stage_assignment.projectNumber
);
```

⚠️ **WARNING:** Only run this if you confirm it won't break existing functionality.

### Fix 3: Add Null Safety in Controller
```javascript
// In stage.controller.js getActiveStagesByProjectNumber
const rbac = req.rbac || { isManager: false, ownedStages: [], ownedSubstages: [] }

// Add explicit undefined check
if (rbac.isManager !== true && rbac.isManager !== false) {
  console.error('[Stage Controller] rbac.isManager is undefined! rbac:', rbac)
  rbac.isManager = false
}
```

### Fix 4: Strengthen Route Parameter Detection
```javascript
// In rbacMiddleware.js
if (!projectNumber) {
  console.error('[RBAC] Could not determine projectNumber from request:', {
    params: req.params,
    body: req.body,
    url: req.url
  })
  throw new ApiError(400, 'Project number is required')
}
```

## Next Steps

1. **Add diagnostic logging** to middleware and controller
2. **Restart backend server** and observe console logs
3. **Login as Manager** (Tanmay, ID 98) and navigate to project
4. **Check browser DevTools** Network tab for API calls and responses
5. **Check backend console** for RBAC logs
6. **Query database** to verify `projectCreatedBy` and employee IDs match

Once logs are captured, we can identify the exact failure point and apply the targeted fix.

---

**Created:** 2026-08-21
**Status:** Diagnosis in progress - awaiting runtime logs
