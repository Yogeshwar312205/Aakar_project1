# RBAC Manager Access Fix - Testing Checklist

## Pre-Deployment Checklist

- [ ] Backup current database
- [ ] Backup current code
- [ ] Review all changed files
- [ ] Verify no syntax errors (run diagnostics)
- [ ] Review console.log statements (remove if needed for production)

## Deployment Steps

- [ ] Stop backend server
- [ ] Deploy updated files:
  - [ ] `backend/middleware/rbacMiddleware.js`
  - [ ] `backend/controllers/stage.controller.js`
  - [ ] `backend/controllers/substage.controller.js`
  - [ ] `backend/controllers/bom.controller.js`
- [ ] Start backend server
- [ ] Verify server starts without errors
- [ ] Check server logs for startup messages

## Test Scenario 1: Project Creator (Manager) Access

### Setup:
- User: Project creator (the employee who created the project)
- Project: Any project created by this user
- Expected: Full access to everything

### Test Steps:

- [ ] Login as project creator
- [ ] Navigate to Projects list
- [ ] Click on a project you created
- [ ] **Verify:** You see the "My Project" page

#### Stages:
- [ ] **Verify:** ALL stages are visible (not just assigned ones)
- [ ] **Verify:** Each stage shows correct owner name
- [ ] **Verify:** Each stage has an "Edit" button enabled
- [ ] **Verify:** Progress bars show for all stages
- [ ] **Verify:** You can edit stage progress

#### Substages:
- [ ] Click on any stage
- [ ] **Verify:** ALL substages under that stage are visible
- [ ] **Verify:** Each substage shows correct owner name
- [ ] **Verify:** Substage tree displays correctly with all children
- [ ] **Verify:** All "Edit" buttons are enabled on substages
- [ ] **Verify:** You can add child substages
- [ ] **Verify:** You can delete substages
- [ ] **Verify:** You can edit substage progress
- [ ] **Verify:** Checkbox to mark substages complete is enabled

#### BOMs:
- [ ] Navigate to BOM section
- [ ] **Verify:** ALL BOM items for the project are visible
- [ ] **Verify:** You can add new BOM items
- [ ] **Verify:** You can edit existing BOM items
- [ ] **Verify:** You can delete BOM items
- [ ] **Verify:** You can import BOM from Excel
- [ ] **Verify:** You can import BOM from another project

#### Console Logs:
- [ ] Open browser console (F12)
- [ ] Open server terminal/logs
- [ ] **Verify:** Server logs show: `[RBAC] User is Manager (project creator)`
- [ ] **Verify:** Server logs show: `[Stage Controller] Manager - No filtering`
- [ ] **Verify:** Server logs show: `[Substage Controller] Manager - No filtering`
- [ ] **Verify:** Server logs show: `[BOM Controller] Manager - No filtering`
- [ ] **Verify:** No 403 Forbidden errors in browser console
- [ ] **Verify:** No RBAC-related errors in server logs

## Test Scenario 2: Stage Owner (Assignee) Access

### Setup:
- User: Employee assigned to Stage 1 of a project (NOT the project creator)
- stage_assignment record: `{ employeeId: X, stageId: 1, substageId: NULL }`
- Expected: Access to Stage 1 and all its substages only

### Test Steps:

- [ ] Login as stage owner
- [ ] Navigate to Projects list
- [ ] Click on the project
- [ ] **Verify:** You see the "My Project" page

#### Stages:
- [ ] **Verify:** Only Stage 1 is visible (not other stages)
- [ ] **Verify:** Stage 1 shows correct owner (you)
- [ ] **Verify:** Stage 1 has "Edit" button enabled
- [ ] **Verify:** You can edit Stage 1 progress
- [ ] **Verify:** Other stages are NOT visible

#### Substages:
- [ ] Click on Stage 1
- [ ] **Verify:** ALL substages under Stage 1 are visible
- [ ] **Verify:** You can edit any substage under Stage 1
- [ ] **Verify:** You can add child substages
- [ ] **Verify:** You can delete substages
- [ ] **Verify:** Checkbox to mark substages complete is enabled

#### BOMs:
- [ ] Navigate to BOM section
- [ ] **Verify:** Only BOM items for Stage 1 are visible
- [ ] **Verify:** You can add BOM items to Stage 1
- [ ] **Verify:** You can edit BOM items for Stage 1
- [ ] **Verify:** BOM items for other stages are NOT visible

#### Console Logs:
- [ ] **Verify:** Server logs show: `[RBAC] User is Assignee`
- [ ] **Verify:** Server logs show: `[RBAC] Owned stages: [1]`
- [ ] **Verify:** Server logs show: `[Stage Controller] Filtering stages by ownedStages: [1]`
- [ ] **Verify:** No 403 errors for Stage 1 operations

## Test Scenario 3: Substage Owner (Assignee) Access

### Setup:
- User: Employee assigned to Substage 1.1 only (NOT Stage 1, NOT project creator)
- stage_assignment record: `{ employeeId: Y, stageId: 1, substageId: 5 }`
- Expected: Access to Substage 1.1 only (no stage-level access, no BOM access)

### Test Steps:

- [ ] Login as substage owner
- [ ] Navigate to Projects list
- [ ] Click on the project
- [ ] **Verify:** You see the "My Project" page (or 403 if no stage access at all)

#### Stages:
- [ ] **Verify:** Stage 1 is NOT visible in list (or visible but marked read-only)
- [ ] **Verify:** You cannot edit Stage 1 directly
- [ ] **Verify:** You cannot edit Stage 1 progress

#### Substages:
- [ ] Navigate to Stage 1 (if accessible)
- [ ] **Verify:** Only Substage 1.1 is visible and editable
- [ ] **Verify:** Other substages under Stage 1 are NOT visible
- [ ] **Verify:** You can edit Substage 1.1
- [ ] **Verify:** You can edit Substage 1.1 progress
- [ ] **Verify:** Checkbox for Substage 1.1 is enabled
- [ ] **Verify:** You CANNOT add child substages (depends on design)
- [ ] **Verify:** You CANNOT delete Substage 1.1

#### BOMs:
- [ ] Navigate to BOM section
- [ ] **Verify:** BOM section is empty or shows "No access" message
- [ ] **Verify:** You CANNOT add BOM items
- [ ] **Verify:** You CANNOT edit BOM items

#### Console Logs:
- [ ] **Verify:** Server logs show: `[RBAC] User is Assignee`
- [ ] **Verify:** Server logs show: `[RBAC] Owned substages: [5]`
- [ ] **Verify:** Server logs show: `[Substage Controller] Filtering by ownedSubstages: [5]`
- [ ] **Verify:** 403 errors for unauthorized operations

## Test Scenario 4: No Access (Employee Not Assigned)

### Setup:
- User: Employee with NO assignments to the project
- Expected: Cannot access project at all

### Test Steps:

- [ ] Login as unassigned employee
- [ ] Navigate to Projects list
- [ ] **Verify:** The project is NOT visible in the list
- [ ] Try to access project URL directly: `/myProject/{projectNumber}`
- [ ] **Verify:** You get 403 Forbidden error
- [ ] **Verify:** Error message: "You do not have permission to access this project"

#### Console Logs:
- [ ] **Verify:** Server logs show: `[RBAC] No assignments found - Access denied`
- [ ] **Verify:** 403 response sent

## Test Scenario 5: Cross-Project Isolation

### Setup:
- User: Project Creator for Project A
- Test: Verify Project A assignments don't grant access to Project B

### Test Steps:

- [ ] Login as Project A creator
- [ ] Navigate to Project A
- [ ] **Verify:** You have full access to Project A (Manager role)
- [ ] Navigate to Project B (different project, NOT created by you)
- [ ] **Verify:** You get 403 Forbidden error (or no access)
- [ ] **Verify:** Being Manager of Project A does NOT give you access to Project B

## Test Scenario 6: Employee Name Display

### Setup:
- Any project with multiple stages owned by different employees

### Test Steps:

- [ ] Login as project creator (to see all stages)
- [ ] Navigate to "My Project" page
- [ ] **Verify:** Each stage shows the CORRECT owner name
- [ ] **Verify:** Owner names match the employee names from employee table
- [ ] **Verify:** No generic names like "Employee 1", "Employee 2"
- [ ] **Verify:** No array indexes shown
- [ ] Click on a stage
- [ ] **Verify:** Each substage shows the CORRECT owner name

## Test Scenario 7: Ownership Indicators (Tick/Checked Status)

### Setup:
- Login as Stage Owner for Stage 1
- Another employee owns Stage 2

### Test Steps:

- [ ] Navigate to "My Project" page
- [ ] **Verify:** Stage 1 shows "Owner" badge or is highlighted as yours
- [ ] **Verify:** Stage 2 does NOT show "Owner" badge
- [ ] **Verify:** Stage 2 shows "Read Only" badge (if visible)
- [ ] Click on Stage 1
- [ ] **Verify:** Substages you directly own show "Owner" badge
- [ ] **Verify:** Substages you inherit access to show "Inherited Access" badge
- [ ] **Verify:** No incorrect checked/selected states

## Database Verification

### Check project table:
```sql
SELECT projectNumber, companyName, projectCreatedBy FROM project WHERE projectNumber = 'P001';
```
- [ ] **Verify:** projectCreatedBy matches employeeId of project creator

### Check employee table:
```sql
SELECT employeeId, employeeName, customEmployeeId FROM employee WHERE employeeId = X;
```
- [ ] **Verify:** employeeId is used correctly (not customEmployeeId for RBAC)

### Check stage table:
```sql
SELECT stageId, stageName, owner, projectNumber FROM stage WHERE projectNumber = 'P001';
```
- [ ] **Verify:** owner field contains employeeId (not name)

### Check substage table:
```sql
SELECT substageId, substageName, owner, stageId FROM substage WHERE stageId = 1;
```
- [ ] **Verify:** owner field contains employeeId (not name)

### Check stage_assignment table:
```sql
SELECT * FROM stage_assignment WHERE projectNumber = 'P001';
```
- [ ] **Verify:** Assignments exist for non-creator employees
- [ ] **Verify:** employeeId, stageId, substageId are correctly linked

## Performance Testing

- [ ] Login as Manager of project with 50+ stages
- [ ] **Verify:** Page loads within acceptable time (<3 seconds)
- [ ] **Verify:** No N+1 query issues in server logs
- [ ] **Verify:** Console logs don't flood with repeated messages

## Regression Testing

- [ ] Test stage creation (ensure RBAC doesn't break it)
- [ ] Test substage creation
- [ ] Test stage deletion
- [ ] Test substage deletion
- [ ] Test project creation
- [ ] Test project editing
- [ ] Test BOM import from Excel
- [ ] Test progress updates (stage and substage)
- [ ] Test project status auto-calculation
- [ ] Test Gantt chart view
- [ ] Test project history view

## Security Testing

- [ ] Try to access another user's project via direct URL
- [ ] Try to edit a stage you don't own (use API directly)
- [ ] Try to delete a substage you don't own
- [ ] Try to add BOM to a stage you don't own
- [ ] **Verify:** All unauthorized operations return 403 Forbidden
- [ ] **Verify:** No sensitive data leaked in error messages

## Post-Deployment Checklist

- [ ] Monitor server logs for 403 errors
- [ ] Monitor server logs for RBAC-related errors
- [ ] Collect user feedback (project creators and assignees)
- [ ] Document any issues found
- [ ] Plan follow-up fixes if needed
- [ ] Consider removing/reducing console.log statements for production

## Acceptance Criteria

✅ **PASS** if:
- Project creators can see and edit ALL stages/substages/BOMs
- Stage owners can see and edit their assigned stages and substages
- Substage owners can see and edit only their assigned substages
- No cross-project access leaks
- Employee names display correctly
- Ownership indicators are accurate
- No 403 errors for authorized operations
- No syntax/runtime errors

❌ **FAIL** if:
- Project creator cannot see all stages
- Assignee can see stages they're not assigned to
- Employee names are incorrect or generic
- Ownership indicators show wrong users
- 403 errors for authorized operations
- Cross-project access works when it shouldn't
- Server crashes or throws errors

---

**Tester Name:** ________________  
**Date:** ________________  
**Environment:** ☐ Staging  ☐ Production  
**Overall Status:** ☐ PASS  ☐ FAIL  ☐ PARTIAL  

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
