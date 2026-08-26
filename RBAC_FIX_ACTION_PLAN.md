# RBAC Fix Action Plan - Manager Access Issue

## Problem Statement
Manager/Project Creator sees:
- "Stages (0) No stages found for this project"
- "🔒 Read Only" badges on stages/substages
- History shows 3 stages exist

Expected: Manager should see ALL stages with full edit access.

## Code Analysis Summary

### ✅ What's Working Correctly

1. **RBAC Middleware Logic** (`backend/middleware/rbacMiddleware.js`)
   - Correctly checks `projectCreatedBy` FIRST
   - Returns immediately with `isManager: true` if user is project creator
   - Never checks `stage_assignment` table for Managers
   
2. **Stage Controller Filtering** (`backend/controllers/stage.controller.js`)
   - Uses explicit `rbac.isManager === false` check
   - Bypasses filtering when `rbac.isManager === true`
   - Should return all stages for Managers

3. **Frontend RBAC Utils** (`frontend/src/utils/rbacUtils.js`)
   - Correctly reads `canEdit` flag from backend
   - `isReadOnly` returns false when `canEdit === true`

### ⚠️ Observed Issues

1. **401 Authentication Errors** (from server logs)
   - All API requests returning 401 Unauthorized
   - Users need to login/refresh tokens
   - This blocks all subsequent RBAC logic

2. **Project Number Format** (from screenshots)
   - URL shows: `/myProject/124345`
   - History shows: `#P24345`
   - **MISMATCH**: Project number might have "P" prefix in database

## Root Cause Hypothesis

### Primary Suspect: Project Number Mismatch

The frontend is using `124345` but the database might store `P24345`.

**Evidence:**
- Screenshot 1 shows URL: `/myProject/124345`
- Screenshot 1 shows badge: `#P24345`
- Screenshot 2 shows different format

**Impact:**
```javascript
// Frontend calls:
fetchActiveStagesByProjectNumber('124345')

// Backend middleware queries:
SELECT projectCreatedBy FROM project WHERE projectNumber = '124345'  // ❌ Not found

// Result: middleware throws 404 "Project not found"
```

### Secondary Suspect: Authentication Token Expiry

**Evidence:**
- All requests returning 401 Unauthorized
- Multiple `/refreshToken` attempts failing

**Impact:**
- No requests reach RBAC middleware
- Frontend shows empty state

## Action Plan

### Step 1: Verify Project Number Format in Database

```sql
-- Check what format is used
SELECT projectNumber, projectCreatedBy, dieName 
FROM project 
WHERE projectNumber LIKE '%24345%' 
OR projectNumber LIKE '%XYZ_ABC%';

-- Check user IDs
SELECT employeeId, customEmployeeId, employeeName 
FROM employee 
WHERE customEmployeeId IN ('98', '99');

-- Check stages
SELECT stageId, stageName, owner, projectNumber 
FROM stage 
WHERE projectNumber LIKE '%24345%' 
AND historyOf IS NULL;
```

### Step 2: Check Authentication Status

**In Browser DevTools Console:**
```javascript
// Check if user is logged in
console.log('Access Token:', document.cookie)
console.log('Local Storage:', localStorage)
console.log('Session Storage:', sessionStorage)
```

**Expected:**
- Should see accessToken cookie
- Should see user data in localStorage/Redux state

### Step 3: Test API Directly (After Login)

**In Browser DevTools Console (while logged in as Manager):**
```javascript
// Get current project number from URL
const projectNumber = window.location.pathname.split('/').pop()
console.log('Project Number:', projectNumber)

// Test API call
fetch(`/api/activeStages/${projectNumber}`, {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err))
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "stageId": 123,
      "stageName": "Stage Name",
      "canEdit": true,
      "canMarkComplete": false,
      "isOwnedByCurrentUser": false
    }
  ],
  "message": "..."
}
```

### Step 4: Check Backend Logs

**After making the API call above, check backend console for:**
```
[RBAC] ========== RBAC MIDDLEWARE DEBUG ==========
[RBAC] User ID: <employeeId>
[RBAC] Project Number: <projectNumber>
[RBAC] Project Creator: <creatorId>
[RBAC] Is Manager?: true/false
[RBAC] ==============================================

[Stage Controller] ========== STAGE QUERY DEBUG ==========
[Stage Controller] RBAC Object: { "isManager": true, ... }
[Stage Controller] ==========================================

[Stage Controller] Stages found: <count>
```

## Immediate Fixes Based on Findings

### Fix A: If Project Number Has "P" Prefix

**Option 1: Update Frontend to Include Prefix**
```javascript
// In stageSlice.js
export const fetchActiveStagesByProjectNumber = createAsyncThunk(
  'stages/fetchActiveStagesByProjectNumber',
  async (id = '') => {
    // Ensure "P" prefix
    const projectNumber = id.startsWith('P') ? id : `P${id}`
    const response = await axios.get(
      `${BASE_URL}/api/activeStages/${projectNumber}`,
      ...
```

**Option 2: Update Backend to Handle Both Formats**
```javascript
// In rbacMiddleware.js
let projectNumber = req.params.projectNumber || req.body.projectNumber || req.params.id

// Try with P prefix if not found
if (projectNumber && !projectNumber.startsWith('P')) {
  const [projectCheck] = await connection.promise().query(
    'SELECT projectNumber FROM project WHERE projectNumber = ? OR projectNumber = ?',
    [projectNumber, `P${projectNumber}`]
  )
  if (projectCheck && projectCheck.length > 0) {
    projectNumber = projectCheck[0].projectNumber
  }
}
```

### Fix B: If projectCreatedBy is NULL

```sql
-- Find projects with NULL creator
SELECT projectNumber, projectCreatedBy, dieName 
FROM project 
WHERE projectCreatedBy IS NULL;

-- Update with correct creator (replace 293 with actual employeeId)
UPDATE project 
SET projectCreatedBy = 293 
WHERE projectNumber = 'P24345' 
AND projectCreatedBy IS NULL;
```

### Fix C: If employeeId Type Mismatch

The middleware logs now show types. If we see:
```
[RBAC] Project Creator Type: string
[RBAC] User ID Type: number
```

Then add type coercion:
```javascript
// In rbacMiddleware.js
if (projectData[0].projectCreatedBy == employeeId) {  // Use == instead of ===
  // Or explicitly convert:
  if (parseInt(projectData[0].projectCreatedBy) === parseInt(employeeId)) {
```

## Testing Checklist

After applying fixes:

### Manager Tests
- [ ] Login as Tanmay (ID 98)
- [ ] Navigate to project P24345
- [ ] Verify stages appear (not "No stages found")
- [ ] Verify stages show "Editable" (not "Read Only")
- [ ] Verify can click to open stage details
- [ ] Verify can edit stage name/dates
- [ ] Verify can create new stages
- [ ] Verify can delete stages

### Employee Tests
- [ ] Login as Yogendra (ID 99)
- [ ] Navigate to project P24345
- [ ] Verify sees ONLY assigned stages
- [ ] Verify assigned stages show "Editable"
- [ ] Verify unassigned stages are hidden (not just read-only)
- [ ] Verify can edit assigned work
- [ ] Verify CANNOT see other employees' stages

## Debug Logging Added

The following debug logs have been added to help diagnose:

### In `backend/middleware/rbacMiddleware.js`:
- User ID and type
- Project Number
- Project Creator ID and type
- Comparison result (Manager check)

### In `backend/controllers/stage.controller.js`:
- RBAC object contents
- SQL query and parameters
- Number of stages found
- Per-stage permission calculation (canEdit, canMarkComplete)

## Next Steps

1. **Login as Manager** (Tanmay, ID 98) in the frontend
2. **Navigate to the project** that shows "No stages found"
3. **Open browser DevTools** and check Console tab
4. **Check backend console** for debug logs
5. **Execute SQL queries** from Step 1 to verify data
6. **Share findings** and I'll provide the targeted fix

---

**Status:** Awaiting runtime logs and database verification
**Priority:** HIGH - Blocking Manager functionality
**Estimated Fix Time:** 15-30 minutes once root cause confirmed
