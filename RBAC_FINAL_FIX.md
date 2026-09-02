# RBAC Final Fix - Complete Stage and Substage Visibility

## Problem Summary

Employees could not see stages/substages they were assigned to. The issues were:

1. **Wrong projectNumber resolution**: rbacMiddleware incorrectly resolved project #107 as substageId, finding wrong projectNumber
2. **Missing parent stage visibility**: If employee owns a substage, parent stage wasn't visible
3. **Permission logic incomplete**: Didn't distinguish between directly owned stages vs parent stages

## Solutions Implemented

### Fix 1: rbacMiddleware - Correct Route Handling

**File**: `backend/middleware/rbacMiddleware.js`

Added special case for `/activeStages/:id` route:

```javascript
// Special case: /activeStages/:id route - id is always projectNumber
if (req.path.startsWith('/activeStages/')) {
  projectNumber = req.params.id
  console.log('[RBAC] Route /activeStages/* - Using id as projectNumber:', projectNumber)
} else {
  // Try to look it up in this order: stage -> substage -> project
  ...
}
```

**Why**: The route `/api/activeStages/:id` expects `id` to be a projectNumber, but middleware was treating it as a substageId.

### Fix 2: rbacMiddleware - Parent Stage Visibility

**File**: `backend/middleware/rbacMiddleware.js`

Added logic to include parent stages of owned substages:

```javascript
// CRITICAL: If employee owns substages, they need to see parent stages too
// Query to get parent stageIds for owned substages
let parentStageIds = []
if (ownedSubstages.length > 0) {
  const [parentStages] = await connection.promise().query(
    'SELECT DISTINCT stageId FROM substage WHERE substageId IN (?)',
    [ownedSubstages]
  )
  parentStageIds = parentStages.map(ps => ps.stageId)
}

// Merge ownedStages with parentStageIds (remove duplicates)
const allVisibleStages = [...new Set([...ownedStages, ...parentStageIds])]

req.rbac = {
  role: 'assignee',
  ownedStages: allVisibleStages, // Includes both directly owned AND parent stages
  directlyOwnedStages: ownedStages, // Only stages directly assigned
  ownedSubstages: ownedSubstages,
  isManager: false,
  projectNumber: projectNumber
}
```

**Why**: Substages need their parent stage to be visible in the UI hierarchy.

### Fix 3: Stage Controller - Permission Distinction

**File**: `backend/controllers/stage.controller.js`

Updated permission flags to distinguish between:
- **Visible** (can see the stage) - uses `ownedStages` (includes parents)
- **Editable** (can modify the stage) - uses `directlyOwnedStages` (only direct assignments)

```javascript
// canEdit: Only directly owned stages can be edited
const canEdit = rbac.isManager === true 
  || (rbac.directlyOwnedStages && rbac.directlyOwnedStages.includes(stage.stageId))

// isVisible: Stage is visible if in ownedStages (includes parent stages)
const isVisible = rbac.isManager === true 
  || (rbac.ownedStages && rbac.ownedStages.includes(stage.stageId))

return {
  ...stage,
  canEdit,
  canMarkComplete,
  isDirectlyOwned: rbac.directlyOwnedStages && rbac.directlyOwnedStages.includes(stage.stageId)
}
```

### Fix 4: Stage Creation - Auto-populate stage_assignment

**File**: `backend/controllers/stage.controller.js`

Added automatic stage_assignment creation when a stage is created:

```javascript
// If owner is different from creator, create a stage_assignment record
if (employeeId !== req.user[0].employeeId) {
  const assignmentQuery = `INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy)
    VALUES (?, ?, NULL, ?, ?)`
  
  db.query(assignmentQuery, [projectNumber, newStageId, employeeId, req.user[0].employeeId], ...)
}
```

## RBAC Logic Summary

### For Manager (Project Creator):
- ✅ Sees ALL stages and substages
- ✅ Can edit ALL stages and substages
- ❌ Cannot mark complete stages/substages owned by others

### For Employee (Assignee):

| Assignment Type | Stage Visibility | Stage Edit | Substage Visibility | Substage Edit |
|----------------|------------------|------------|---------------------|---------------|
| **Stage only** | ✅ Visible | ✅ Editable | ✅ All substages | ❌ Read-only |
| **Stage + Substage** | ✅ Visible | ✅ Editable | ✅ All substages | ✅ Owned ones editable |
| **Substage only** | ✅ Visible (parent) | ❌ Read-only | ✅ Owned only | ✅ Editable |
| **No assignment** | ❌ Hidden | ❌ N/A | ❌ Hidden | ❌ N/A |

## Database Tables

### `stage_assignment` Table Structure:
```sql
CREATE TABLE stage_assignment (
  assignmentId INT AUTO_INCREMENT PRIMARY KEY,
  projectNumber VARCHAR(50),
  stageId INT NULL,           -- NULL if substage-only assignment
  substageId INT NULL,         -- NULL if stage-only assignment
  employeeId INT NOT NULL,
  assignedBy INT NOT NULL,
  assignedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectNumber) REFERENCES project(projectNumber),
  FOREIGN KEY (stageId) REFERENCES stage(stageId),
  FOREIGN KEY (substageId) REFERENCES substage(substageId),
  FOREIGN KEY (employeeId) REFERENCES employee(employeeId),
  FOREIGN KEY (assignedBy) REFERENCES employee(employeeId)
);
```

### Example Assignments:
```sql
-- Tanmay owns Stage 173 (Stage1)
INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy)
VALUES (107, 173, NULL, 293, 290);

-- Tanmay owns Substage 251 (web) within Stage 173
INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy)
VALUES (107, NULL, 251, 293, 290);
```

## Testing Scenarios

### Test 1: Employee with Stage Assignment Only
- **Setup**: Tanmay owns Stage 173
- **Expected**: 
  - ✅ Stage 173 visible
  - ✅ Stage 173 editable
  - ✅ All substages under Stage 173 visible
  - ❌ Substages read-only (unless separately assigned)

### Test 2: Employee with Substage Assignment Only  
- **Setup**: Tanmay owns Substage 251 (under Stage 173)
- **Expected**:
  - ✅ Stage 173 visible (parent)
  - ❌ Stage 173 read-only
  - ✅ Substage 251 visible and editable
  - ❌ Other substages under Stage 173 hidden

### Test 3: Employee with Stage + Substage Assignment
- **Setup**: Tanmay owns Stage 173 AND Substage 251
- **Expected**:
  - ✅ Stage 173 visible and editable
  - ✅ All substages visible
  - ✅ Substage 251 editable
  - ❌ Other substages read-only

### Test 4: Manager
- **Setup**: Yogendra is project creator
- **Expected**:
  - ✅ All stages visible and editable
  - ✅ All substages visible and editable
  - ❌ Cannot mark complete others' work

## API Endpoints and RBAC Flow

### GET /api/activeStages/:projectNumber
1. `authMiddleware` → Validates JWT token
2. `requireProjectAccess` → Checks module permission
3. **`rbacMiddleware`** → Resolves projectNumber, checks role, populates `req.rbac`
4. `getActiveStagesByProjectNumber` → Filters stages by `ownedStages`, adds permission flags

### GET /api/activeSubStages/:stageId
1. `authMiddleware` → Validates JWT token
2. `requireProjectAccess` → Checks module permission
3. **`rbacMiddleware`** → Resolves stageId → projectNumber, populates `req.rbac`
4. `getActiveSubStagesByStageId` → Filters substages by ownership, adds permission flags

## Backend Logs to Watch

When Tanmay (ID: 293) accesses project #107:

```
[RBAC] Route /activeStages/* - Using id as projectNumber: 107
[RBAC] Checking access for: { employeeId: 293, projectNumber: 107 }
[RBAC] Assignments found: 4
[RBAC] User is Assignee - Owned stages: [173, 175] Owned substages: [251, 252]
[RBAC] Parent stages for owned substages: [173]
[RBAC] Final visible stages (owned + parents of owned substages): [173, 175]
[Stage Controller] Filtering stages by ownedStages: [173, 175]
[Stage Controller] Stages found: 2
[Stage Controller] Stage 173: canEdit=true, isDirectlyOwned=true
[Stage Controller] Stage 175: canEdit=true, isDirectlyOwned=true
```

## Files Modified

1. `backend/middleware/rbacMiddleware.js` - Added route-specific handling & parent stage logic
2. `backend/controllers/stage.controller.js` - Updated permission flags, added auto-assignment
3. `backend/controllers/substage.controller.js` - Already had correct RBAC filtering

## Migration/Cleanup Scripts

### Populate Existing Assignments
**Script**: `backend/scripts/populate_stage_assignments.mjs`

Scans all existing stages/substages and creates `stage_assignment` records where owner ≠ project creator.

**Run**: `node backend/scripts/populate_stage_assignments.mjs`

---

**Status**: ✅ FIXED
**Testing**: Required with multiple users and assignment scenarios
**Impact**: High - Fixes critical RBAC issue for all employee dashboards
