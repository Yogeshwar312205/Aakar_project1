# RBAC canMarkComplete Permission Implementation

## Summary

Implemented separate `canMarkComplete` permission distinct from `canEdit` to enforce the rule that **only the assigned employee (direct owner) can mark their task as completed**, even if they are not the Manager/Project Creator.

## Key Requirements Implemented

### 1. Manager/Project Creator Access
✅ **Full Visibility & Edit Access:**
- Managers can see ALL stages and substages
- Managers can edit ALL stages and substages
- Managers NEVER see "Read Only" for their own project

✅ **Completion Restriction:**
- **Managers CANNOT mark another employee's task as complete**
- Only the assigned employee (owner) can mark their own work as complete

### 2. Assigned Employee Access
✅ **Stage Owner:**
- Can see their assigned stage
- Can edit their assigned stage
- Can mark their assigned stage as complete
- Can see and edit all substages under their stage
- Can mark substages under their stage as complete (if they own them)

✅ **Substage Owner:**
- Can see only their assigned substage
- Can edit only their assigned substage
- Can mark only their assigned substage as complete

### 3. Access Isolation
✅ **Employee B cannot see Employee A's work**
✅ **Employees without assignments cannot see any stages/substages**
✅ **Cross-project isolation maintained**

---

## Technical Implementation

### Backend Changes

#### 1. Stage Controller (`backend/controllers/stage.controller.js`)

**Function: `getActiveStagesByProjectNumber`**

Added three new fields to each stage object:

```javascript
const currentUserId = req.user[0]?.employeeId

const stages = data.map((stage) => {
  // Determine if current user directly owns this stage
  const isDirectOwner = stage.owner === currentUserId // stage.owner is employeeId from DB
  
  // canEdit: Manager can edit all, Assignee can edit only owned stages
  const canEdit = rbac.isManager === true || (rbac.ownedStages && rbac.ownedStages.includes(stage.stageId))
  
  // canMarkComplete: Only the direct owner can mark as complete
  const canMarkComplete = isDirectOwner
  
  return {
    ...stage,
    canEdit,
    canMarkComplete,
    isOwnedByCurrentUser: isDirectOwner,
    // ... other fields
  }
})
```

**Key Points:**
- `canEdit`: Based on Manager status OR stage assignment
- `canMarkComplete`: Based ONLY on direct ownership (`stage.owner === currentUserId`)
- `isOwnedByCurrentUser`: For UI display (shows ownership badge)

**Function: `getSingleStageByStageId`**

Updated query to include `ownerEmployeeId`:
```sql
SELECT s.*, 
       eo.employeeName AS owner, 
       eo.employeeId AS ownerEmployeeId,
       ...
FROM stage s
INNER JOIN employee eo ON s.owner = eo.employeeId
```

Then added same permission flags as above.

#### 2. Substage Controller (`backend/controllers/substage.controller.js`)

**Function: `getSubStagesByStageId`**

Similar changes as stage controller:

```javascript
const currentUserId = req.user[0]?.employeeId

// Updated query to include ownerEmployeeId
let query = `SELECT ss.*, 
             eo.employeeId AS ownerEmployeeId,
             ...
             FROM substage ss
             INNER JOIN employee eo ON ss.owner = eo.employeeId`

const substages = data.map((substage) => {
  const isDirectOwner = substage.ownerEmployeeId === currentUserId
  
  const canEdit = rbac.isManager === true
    || (rbac.ownedSubstages && rbac.ownedSubstages.includes(substage.substageId))
    || (rbac.ownedStages && rbac.ownedStages.includes(parseInt(stageId)))
  
  const canMarkComplete = isDirectOwner
  
  return {
    ...substage,
    canEdit,
    canMarkComplete,
    isOwnedByUser: rbac.ownedSubstages && rbac.ownedSubstages.includes(substage.substageId),
    isOwnedByCurrentUser: isDirectOwner,
    // ... other fields
  }
})
```

**Key Points:**
- Manager or stage owner can EDIT all substages under that stage
- But only the direct owner (substage.owner) can MARK AS COMPLETE
- `isOwnedByUser`: Assignment-based (from stage_assignment table)
- `isOwnedByCurrentUser`: Ownership-based (from substage.owner field)

**Function: `toggleSubStageCompletion`**

Added **backend permission enforcement**:

```javascript
export const toggleSubStageCompletion = asyncHandler(async (req, res) => {
  const substageId = req.params.id
  const currentUserId = req.user[0]?.employeeId

  // Get substage owner
  const [substageData] = await db.promise().query(
    'SELECT owner, stageId, projectNumber FROM substage WHERE substageId = ?',
    [substageId]
  )
  
  const substageOwner = substageData[0].owner // This is employeeId
  
  // Permission check: Only direct owner can mark as complete
  if (substageOwner !== currentUserId) {
    console.log('[Substage Controller] Permission denied: User', currentUserId, 'cannot mark substage', substageId, 'as complete. Owner is:', substageOwner)
    return res.status(403).json(
      new ApiError(403, 'Only the assigned employee can mark this task as completed')
    )
  }
  
  console.log('[Substage Controller] User', currentUserId, 'is owner - allowing completion toggle')
  
  // ... rest of the function
})
```

**Key Points:**
- **Backend enforcement prevents API bypass**
- Returns 403 if non-owner tries to mark as complete
- Includes detailed console logging
- Works correctly even if Manager tries via API

**Function: `updateSubStageProgress`**

Added similar permission check for setting progress to 100%:

```javascript
export const updateSubStageProgress = asyncHandler(async (req, res) => {
  const substageId = req.params.id
  const { progress } = req.body
  const currentUserId = req.user[0]?.employeeId

  const newProgress = Math.round(progress)
  const isCompleted = newProgress >= 100 ? 1 : 0
  
  // Permission check: Only direct owner can set to 100%
  if (isCompleted) {
    const [substageData] = await db.promise().query(
      'SELECT owner FROM substage WHERE substageId = ?',
      [substageId]
    )
    
    const substageOwner = substageData[0].owner
    
    if (substageOwner !== currentUserId) {
      console.log('[Substage Controller] Permission denied: User', currentUserId, 'cannot set substage', substageId, 'to 100%. Owner is:', substageOwner)
      return res.status(403).json(
        new ApiError(403, 'Only the assigned employee can mark this task as completed (100%)')
      )
    }
  }
  
  // ... rest of the function
})
```

**Key Points:**
- Progress 0-99% can be edited by anyone with edit access
- Progress 100% can only be set by the direct owner
- This prevents Managers from completing others' tasks via progress slider

#### 3. Routes (`backend/routes/substage.routes.js`)

Added `rbacMiddleware` to completion routes:

```javascript
router.put('/subStages/:id/completion', authMiddleware, requireProjectAccess('substage', 'update'), rbacMiddleware, toggleSubStageCompletion)
router.put('/subStages/:id/progress', authMiddleware, requireProjectAccess('substage', 'update'), rbacMiddleware, updateSubStageProgress)
```

**Key Points:**
- RBAC middleware attaches role context to request
- Controller uses this context for permission checks

---

### Frontend Changes

#### 1. RBAC Utils (`frontend/src/utils/rbacUtils.js`)

Added new utility functions:

```javascript
/**
 * Check if user can mark a stage as complete
 */
export const canMarkStageComplete = (stage) => {
  if (!stage) return false;
  return stage.canMarkComplete === true;
};

/**
 * Check if user can mark a substage as complete
 */
export const canMarkSubstageComplete = (substage) => {
  if (!substage) return false;
  return substage.canMarkComplete === true;
};
```

**Key Points:**
- Simple wrappers around backend-provided flags
- Separates edit permission from completion permission
- Easy to use in components

#### 2. SubstageTreeNode Component (`frontend/src/components/common/SubstageTreeNode/SubstageTreeNode.jsx`)

**Import:**
```javascript
import { canEditSubstage, canMarkSubstageComplete, isReadOnly, getPermissionBadge } from '../../../utils/rbacUtils.js'
```

**Permission Checks:**
```javascript
const editable = canEditSubstage(node) // Can edit details
const canComplete = canMarkSubstageComplete(node) // Can mark as complete
const readonly = isReadOnly(node) // Read-only access
```

**Checkbox (Mark Complete):**
```javascript
<input
  type="checkbox"
  checked={isCompleted}
  onChange={handleCheckboxChange}
  disabled={!canComplete || (hasChildren && !areAllChildrenCompleted(node))}
  title={
    !canComplete
      ? 'Only the assigned employee can mark this task as complete'
      : hasChildren && !areAllChildrenCompleted(node)
      ? 'Complete all child substages first'
      : isCompleted ? 'Mark as incomplete' : 'Mark as complete'
  }
/>
```

**Key Points:**
- Checkbox uses `canComplete` (not `editable`)
- Clear tooltip explains why checkbox is disabled
- Manager will see disabled checkbox for others' tasks

**Progress Edit:**
```javascript
const handleProgressSave = (e) => {
  const val = Math.max(0, Math.min(100, Math.round(Number(progressValue))))
  setEditingProgress(false)

  if (val >= 100) {
    // Check permission to mark as complete
    if (!canComplete) {
      alert('Only the assigned employee can mark this task as 100% complete')
      return
    }
    // ... show date dialog
  }
  
  // Allow progress 0-99% for anyone with edit access
  if (onProgressEdit && val !== (node.progress || 0)) {
    onProgressEdit(node.substageId, val)
  }
}
```

**Key Points:**
- Progress 0-99%: Anyone with `canEdit` can update
- Progress 100%: Requires `canMarkComplete`
- Clear alert message if permission denied
- Backend also enforces this rule

---

## Permission Matrix

| User Type | Stage/Substage | canEdit | canMarkComplete | Behavior |
|-----------|---------------|---------|-----------------|----------|
| **Manager** | Any stage | ✅ Yes | ❌ Only if owner | Can edit but not complete others' work |
| **Manager** | Any substage | ✅ Yes | ❌ Only if owner | Can edit but not complete others' work |
| **Stage Owner** | Owned stage | ✅ Yes | ✅ Yes (if owner) | Full control over owned stage |
| **Stage Owner** | Substages under owned stage | ✅ Yes | ❌ Only if owner | Can edit but not complete |
| **Substage Owner** | Owned substage | ✅ Yes | ✅ Yes | Full control over owned substage |
| **Substage Owner** | Other substages | ❌ No | ❌ No | No access |
| **Unassigned Employee** | Any stage/substage | ❌ No | ❌ No | No access |

---

## Data Flow

### Manager Viewing Project

```
1. Manager clicks on their project
2. Frontend: GET /api/stages/active/:projectNumber
3. Middleware: authMiddleware → rbacMiddleware
4. rbacMiddleware: Checks projectCreatedBy === currentUserId
   → Sets rbac.isManager = true
5. Controller: No SQL filtering (Manager sees all)
6. Controller: For each stage:
   - canEdit = true (Manager can edit all)
   - canMarkComplete = (stage.owner === currentUserId)
   - isOwnedByCurrentUser = (stage.owner === currentUserId)
7. Response: All stages with permission flags
8. Frontend: Renders all stages
   - Edit buttons: Enabled (canEdit = true)
   - Checkboxes: Disabled for others' stages (canMarkComplete = false)
   - Shows "Not your task" tooltip on disabled checkboxes
```

### Assigned Employee Viewing Their Work

```
1. Employee clicks on assigned project
2. Frontend: GET /api/stages/active/:projectNumber
3. Middleware: authMiddleware → rbacMiddleware
4. rbacMiddleware: Checks projectCreatedBy !== currentUserId
   → Queries stage_assignment table
   → Sets rbac.isManager = false, rbac.ownedStages = [1, 2]
5. Controller: SQL filtering by ownedStages
   → WHERE stageId IN (1, 2)
6. Controller: For each stage:
   - canEdit = (rbac.ownedStages.includes(stageId))
   - canMarkComplete = (stage.owner === currentUserId)
   - isOwnedByCurrentUser = (stage.owner === currentUserId)
7. Response: Only assigned stages with permission flags
8. Frontend: Renders only assigned stages
   - Edit buttons: Enabled
   - Checkboxes: Enabled (they own these stages)
```

### Manager Trying to Complete Employee's Task

```
1. Manager clicks checkbox on Employee A's substage
2. Frontend: Checkbox is disabled (canMarkComplete = false)
3. If Manager tries via API directly:
   PUT /api/substages/:id/completion
4. Controller: Checks substage.owner === currentUserId
   → False (owner is Employee A, current is Manager)
5. Response: 403 Forbidden "Only the assigned employee can mark this task as completed"
6. Frontend: Shows error toast
```

---

## Database Schema

### owner Field

The `owner` field in `stage` and `substage` tables stores the **employeeId** (not name, not customEmployeeId):

```sql
-- stage table
CREATE TABLE stage (
  stageId INT PRIMARY KEY,
  projectNumber VARCHAR(50),
  stageName VARCHAR(255),
  owner INT, -- STORES employeeId
  -- ... other fields
  FOREIGN KEY (owner) REFERENCES employee(employeeId)
);

-- substage table
CREATE TABLE substage (
  substageId INT PRIMARY KEY,
  stageId INT,
  substageName VARCHAR(255),
  owner INT, -- STORES employeeId
  -- ... other fields
  FOREIGN KEY (owner) REFERENCES employee(employeeId)
);
```

### Query Pattern

To get owner information:

```sql
SELECT s.*, 
       eo.employeeName AS owner,        -- Display name for UI
       eo.customEmployeeId AS ownerId,  -- Custom ID for display
       eo.employeeId AS ownerEmployeeId -- For ownership comparison
FROM stage s
INNER JOIN employee eo ON s.owner = eo.employeeId
WHERE s.stageId = ?
```

Then in code:
```javascript
const isDirectOwner = stage.ownerEmployeeId === currentUserId
```

---

## Testing Scenarios

### Test 1: Manager Cannot Complete Employee's Task

**Setup:**
- Manager (employeeId: 1) created project P001
- Employee A (employeeId: 5) owns Stage 1

**Test:**
1. Login as Manager
2. Navigate to Project P001
3. See Stage 1 (owned by Employee A)
4. ✅ Edit button is enabled (canEdit = true)
5. ✅ Checkbox is disabled (canMarkComplete = false)
6. ✅ Tooltip says "Only the assigned employee can mark this task as complete"
7. Try clicking checkbox → Nothing happens
8. Try API call: `PUT /api/substages/1/completion` with Manager token
9. ✅ Response: 403 Forbidden
10. ✅ Error message: "Only the assigned employee can mark this task as completed"

### Test 2: Manager Can Edit But Not Complete

**Setup:**
- Manager (employeeId: 1) created project P001
- Employee A (employeeId: 5) owns Substage 1.1

**Test:**
1. Login as Manager
2. Navigate to Project P001 → Stage 1 → Substage 1.1
3. ✅ "Edit" button is enabled
4. Click "Edit" → Modal opens
5. ✅ Can change name, dates, duration
6. ✅ Can save changes successfully
7. ✅ Progress slider: Can change from 0% to 99%
8. ✅ Progress slider: Cannot set to 100%
9. Try setting to 100% → Alert: "Only the assigned employee can mark this task as 100% complete"
10. ✅ Checkbox is disabled
11. ✅ Manager can edit but not complete

### Test 3: Employee Can Complete Their Own Work

**Setup:**
- Employee A (employeeId: 5) owns Substage 1.1

**Test:**
1. Login as Employee A
2. Navigate to Project P001 → Stage 1 → Substage 1.1
3. ✅ "Edit" button is enabled (canEdit = true)
4. ✅ Checkbox is enabled (canMarkComplete = true)
5. ✅ Progress slider can go to 100%
6. Set progress to 100% → Date dialog appears
7. Enter dates → Click "Complete"
8. ✅ Request: `PUT /api/substages/1/completion` with Employee A token
9. ✅ Response: 200 OK
10. ✅ Substage marked as complete
11. ✅ Checkbox is now checked

### Test 4: Employee B Cannot See Employee A's Work

**Setup:**
- Employee A (employeeId: 5) owns Stage 1
- Employee B (employeeId: 10) owns Stage 2

**Test:**
1. Login as Employee B
2. Navigate to Project P001
3. ✅ Sees Stage 2 (owned by them)
4. ✅ Does NOT see Stage 1 (owned by Employee A)
5. Try API call: `GET /api/stages/active/P001` with Employee B token
6. ✅ Response: Only includes Stage 2
7. Try accessing Stage 1 via API: `GET /api/stages/1` with Employee B token
8. ✅ Response: 403 Forbidden (RBAC middleware blocks)

### Test 5: Stage Owner Can Edit Substages But Not Complete

**Setup:**
- Employee A (employeeId: 5) owns Stage 1
- Substage 1.1 under Stage 1 is owned by Employee B (employeeId: 10)

**Test:**
1. Login as Employee A (Stage Owner)
2. Navigate to Project P001 → Stage 1
3. ✅ Sees Substage 1.1 (owned by Employee B)
4. ✅ "Edit" button is enabled for Substage 1.1 (canEdit = true)
5. ✅ Checkbox is disabled for Substage 1.1 (canMarkComplete = false)
6. ✅ Tooltip: "Only the assigned employee can mark this task as complete"
7. Click "Edit" → Can modify details
8. ✅ Can save changes
9. Try checking checkbox → Nothing happens (disabled)
10. Try API: `PUT /api/substages/1.1/completion` with Employee A token
11. ✅ Response: 403 Forbidden

---

## Console Logs for Debugging

### Successful Completion by Owner

```
[RBAC] Checking access for: { employeeId: 5, projectNumber: 'P001' }
[RBAC] Assignments found: 2
[RBAC] User is Assignee - Owned stages: [1] Owned substages: [11]
[Substage Controller] Getting substages for stageId: 1 RBAC: { isManager: false, ownedStages: [1], ownedSubstages: [11] }
[Substage Controller] User is Assignee - Owns parent stage: true
[Substage Controller] User owns parent stage - showing all substages
[Substage Controller] Substages found: 3
[Substage Controller] Returning 3 substages with canEdit and canMarkComplete flags
[Substage Controller] User 5 is owner of substage 11 - allowing completion toggle
```

### Denied Completion by Manager

```
[RBAC] Checking access for: { employeeId: 1, projectNumber: 'P001' }
[RBAC] Project creator: 1 Current user: 1
[RBAC] User is Manager (project creator)
[Substage Controller] Getting substages for stageId: 1 RBAC: { isManager: true, ownedStages: [], role: 'manager' }
[Substage Controller] Manager - No filtering, returning all substages
[Substage Controller] Substages found: 3
[Substage Controller] Returning 3 substages with canEdit and canMarkComplete flags
[Substage Controller] Permission denied: User 1 cannot mark substage 11 as complete. Owner is: 5
```

---

## API Response Examples

### Stage Response (Manager View)

```json
{
  "statusCode": 200,
  "data": [
    {
      "stageId": 1,
      "stageName": "Design",
      "owner": "John Doe",
      "ownerId": "EMP005",
      "ownerEmployeeId": 5,
      "canEdit": true,
      "canMarkComplete": false,
      "isOwnedByCurrentUser": false,
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "progress": 50
    }
  ],
  "message": "Active stages retrieved successfully."
}
```

**Interpretation:**
- Manager CAN edit this stage (canEdit: true)
- Manager CANNOT mark as complete (canMarkComplete: false)
- Not owned by current user (isOwnedByCurrentUser: false)

### Substage Response (Owner View)

```json
{
  "statusCode": 200,
  "data": [
    {
      "substageId": 11,
      "substageName": "Create mockups",
      "owner": "John Doe",
      "ownerId": "EMP005",
      "ownerEmployeeId": 5,
      "canEdit": true,
      "canMarkComplete": true,
      "isOwnedByCurrentUser": true,
      "isOwnedByUser": true,
      "startDate": "2024-01-05",
      "endDate": "2024-01-10",
      "progress": 75
    }
  ],
  "message": "Substages retrieved successfully."
}
```

**Interpretation:**
- User CAN edit (canEdit: true)
- User CAN mark as complete (canMarkComplete: true)
- Owned by current user (isOwnedByCurrentUser: true)
- User has assignment for this (isOwnedByUser: true)

---

## Deployment Checklist

### Backend

- [x] Update `stage.controller.js` - Add canMarkComplete logic
- [x] Update `substage.controller.js` - Add canMarkComplete logic
- [x] Update `toggleSubStageCompletion` - Add permission check
- [x] Update `updateSubStageProgress` - Add permission check
- [x] Update `substage.routes.js` - Add rbacMiddleware to routes
- [x] No syntax errors
- [x] Console logging added

### Frontend

- [x] Update `rbacUtils.js` - Add canMarkStageComplete, canMarkSubstageComplete
- [x] Update `SubstageTreeNode.jsx` - Use canMarkComplete for checkbox
- [x] Update `SubstageTreeNode.jsx` - Check permission in progress handler
- [x] Import new functions
- [x] Add clear tooltip messages
- [x] No syntax errors

### Testing

- [ ] Test Manager viewing their project (sees all, can edit all, cannot complete others' work)
- [ ] Test Manager trying to complete employee's task (403 error)
- [ ] Test Employee A completing their own task (success)
- [ ] Test Employee B viewing project (sees only their work)
- [ ] Test Stage Owner editing substages (can edit, cannot complete if not owner)
- [ ] Test progress slider to 100% by non-owner (blocked with alert)
- [ ] Test checkbox disabled for non-owners (with tooltip)

### Database

- [x] No schema changes required
- [x] owner field already stores employeeId
- [x] stage_assignment table already exists

---

## Comparison: Old vs New

### Old Behavior (Before canMarkComplete)

```javascript
// Old: canEdit controlled everything
canEdit: rbac.isManager || rbac.ownedStages.includes(stageId)

// Checkbox
disabled={!canEdit}

// Result: Manager could complete any task
```

**Issues:**
- ❌ Manager could mark others' tasks as complete
- ❌ No separation between edit and complete permissions
- ❌ Violated requirement: "only assigned employee can complete"

### New Behavior (With canMarkComplete)

```javascript
// New: Separate permissions
canEdit: rbac.isManager === true || rbac.ownedStages.includes(stageId)
canMarkComplete: stage.owner === currentUserId

// Checkbox
disabled={!canMarkComplete}

// Result: Only owner can complete their task
```

**Benefits:**
- ✅ Manager can edit but not complete others' tasks
- ✅ Clear separation of edit and complete permissions
- ✅ Meets requirement: "only assigned employee can complete"
- ✅ Backend enforces permission (API cannot be bypassed)

---

## Known Limitations

1. **Stage-level completion:** 
   - Currently stages don't have a completion checkbox in UI
   - If needed, same logic can be applied to stages

2. **Bulk operations:**
   - No bulk completion API
   - If added, must check canMarkComplete for each item

3. **Progress calculation:**
   - Stage progress auto-calculates from substages
   - If substage owner doesn't complete, stage stays incomplete
   - This is by design

---

## Future Enhancements

1. **Delegation:**
   - Allow owner to delegate completion permission temporarily
   - Would need new `delegatedTo` field in database

2. **Manager Override:**
   - Add special permission for Manager to override in emergencies
   - Would need audit log of who completed what

3. **Approval Workflow:**
   - Require Manager approval before task marked as complete
   - Would need `completionStatus: 'pending' | 'approved' | 'rejected'`

---

## Conclusion

The `canMarkComplete` permission successfully implements the requirement that **only the assigned employee can mark their task as completed**, while still allowing Managers and other authorized users to edit task details.

**Key Achievements:**
- ✅ Managers can see and edit all work but cannot complete others' tasks
- ✅ Employees can complete only their own assigned work
- ✅ Backend enforcement prevents API bypass
- ✅ Frontend provides clear visual feedback with tooltips
- ✅ Separate permissions for edit vs complete
- ✅ No breaking changes to existing functionality

**Deployment Status:** ✅ Ready for Testing

---

**Document Version:** 1.0  
**Last Updated:** $(date)  
**Status:** ✅ IMPLEMENTED & READY FOR TESTING
