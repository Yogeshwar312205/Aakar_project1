# Substage RBAC Fix - "Read Only" Issue

## Problem Identified

**ALL substages showed "🔴 Read Only" badge** even for:
- Manager (Yogendra) viewing any substage
- Employee (Tanmay) viewing their own substages

## Root Cause

1. **Route missing rbacMiddleware**: `/activeSubStages/:id` did not have `rbacMiddleware`
2. **Controller missing RBAC logic**: `getActiveSubStagesByStageId` did not set `canEdit` or `canMarkComplete` flags

## Fixes Applied

### Fix 1: Added rbacMiddleware to Route
**File**: `backend/routes/substage.routes.js`

```javascript
// BEFORE:
router.get('/activeSubStages/:id', authMiddleware, requireProjectAccess('substage', 'read'), getActiveSubStagesByStageId)

// AFTER:
router.get('/activeSubStages/:id', authMiddleware, requireProjectAccess('substage', 'read'), rbacMiddleware, getActiveSubStagesByStageId)
```

### Fix 2: Added RBAC Logic to Controller
**File**: `backend/controllers/substage.controller.js`

Added to `getActiveSubStagesByStageId` function:
- Extract `rbac` context from `req.rbac`
- Extract `currentUserId` from `req.user[0].employeeId`
- Apply filtering based on Manager vs Assignee role
- Set `canEdit` flag: `true` for Manager OR if user owns substage OR if user owns parent stage
- Set `canMarkComplete` flag: `true` only if user is direct owner
- Added debug logging to trace permissions

## Expected Behavior After Fix

### For Manager (Yogendra - employeeId 290):
- ✅ Sees ALL substages in the stage
- ✅ All substages show **"Editable"** (not "Read Only")
- ✅ Can edit all substages (name, dates, owner, etc.)
- ✅ Can mark complete ANY substage owned by him
- ✅ Cannot mark complete substages owned by others

### For Employee (Tanmay - employeeId 293):
- ✅ Sees ONLY substages he owns OR substages in stages he owns
- ✅ Owned substages show **"Editable"**
- ✅ Can edit owned substages
- ✅ Can mark complete his own substages
- ❌ Cannot see substages he doesn't own (if parent stage not owned)

## Testing Steps

1. **Refresh browser** - Backend should auto-restart
2. **Login as Yogendra** (Manager)
   - Navigate to project 124345
   - Open any stage
   - **Expected**: All substages show "Editable"
3. **Login as Tanmay** (Employee)
   - Navigate to project 124345
   - Open assigned stage
   - **Expected**: Owned substages show "Editable", others show "Read Only" or hidden

## Backend Logs to Watch

After navigating to a stage, backend will show:
```
[getActiveSubstages] Getting active substages for stageId: 176 RBAC: { isManager: true/false, ownedStages: [...], ownedSubstages: [...] }
[getActiveSubstages] Substage 254 : { substageName: 'Software', owner: 'Yogendra', canEdit: true, canMarkComplete: true/false }
[getActiveSubstages] Returning X substages with canEdit and canMarkComplete flags
```

## Technical Details

### RBAC Logic Flow:
1. **rbacMiddleware** runs first:
   - Extracts stageId from route parameter
   - Queries `stage` table to get `projectNumber`
   - Queries `project` table to check if user is project creator
   - If Manager: sets `req.rbac = { isManager: true, ... }`
   - If Not Manager: queries `stage_assignment` to get owned stages/substages
   
2. **Controller** uses `req.rbac`:
   - If `isManager === true`: No filtering, all substages visible, all editable
   - If `isManager === false`: 
     - Check if user owns parent stage
     - If owns parent stage: show all substages, all editable
     - If doesn't own parent stage: show only owned substages, only those editable

### Permission Flags:
- `canEdit`: Controls visibility of edit UI elements and edit API access
- `canMarkComplete`: Controls visibility of completion checkbox
- `isOwnedByCurrentUser`: UI hint for visual differentiation

## Files Modified

1. `backend/routes/substage.routes.js` - Added `rbacMiddleware`
2. `backend/controllers/substage.controller.js` - Added RBAC logic to `getActiveSubStagesByStageId`

---

**Status**: Fixed ✅
**Testing**: Required
**Impact**: High - Fixes major RBAC issue for all substages
