# Test Access Control - Project Management

This document helps you test and debug the access control for Project Management.

---

## Quick Test Scenarios

### Scenario 1: Full Access to Project Management

**Expected Access String:**
```
0000000000000,1111111111111,0000000000000000000000000,0000000000
```

**Breakdown:**
- Group 0 (HR): `0000000000000` (disabled)
- Group 1 (Project): `1111111111111` (enabled with full access)
  - Position 0: `1` (module enabled)
  - Position 1-4: `1111` (Project: Add, Read, Update, Delete)
  - Position 5-8: `1111` (Stage: Add, Read, Update, Delete)
  - Position 9-12: `1111` (Substage: Add, Read, Update, Delete)
- Group 2 (Training): `0000000000000000000000000` (disabled)
- Group 3 (Ticket): `0000000000` (disabled)

**Steps to Set:**
1. Go to HR Management → Employees
2. Click "Edit" on an employee or "Add Employee"
3. Scroll to "Manage Access" section
4. Toggle ON "Project Management"
5. Check ALL checkboxes for:
   - Project Management: ✓ Add, ✓ Read, ✓ Update, ✓ Delete
   - Stage Management: ✓ Add, ✓ Read, ✓ Update, ✓ Delete
   - Substage Management: ✓ Add, ✓ Read, ✓ Update, ✓ Delete
6. Click "Save"
7. Open Browser Console (F12) and look for: `Updated Access String:`

**Expected UI After Login:**
- ✅ "Add Project" button visible in All Projects page
- ✅ Project list table visible
- ✅ "Edit Project" button visible in project details
- ✅ "Edit Stage" button visible
- ✅ "Edit" button visible on substages
- ✅ Delete icons visible in tables

---

### Scenario 2: Read-Only Access

**Expected Access String:**
```
0000000000000,1010101010101,0000000000000000000000000,0000000000
```

**Breakdown:**
- Group 1 (Project): `1010101010101`
  - Position 0: `1` (module enabled)
  - Position 1-4: `0100` (Project: only Read)
  - Position 5-8: `0100` (Stage: only Read)
  - Position 9-12: `0100` (Substage: only Read)

**Steps to Set:**
1. Toggle ON "Project Management"
2. Check ONLY Read checkbox for all three sub-options
3. Save

**Expected UI After Login:**
- ❌ "Add Project" button hidden
- ✅ Project list table visible
- ❌ "Edit Project" button hidden
- ❌ "Edit Stage" button hidden
- ❌ "Edit" button hidden on substages
- ❌ Delete icons hidden

---

### Scenario 3: Add and Update Only

**Expected Access String:**
```
0000000000000,1101101101101,0000000000000000000000000,0000000000
```

**Breakdown:**
- Group 1 (Project): `1101101101101`
  - Position 0: `1` (module enabled)
  - Position 1-4: `1010` (Project: Add, Update)
  - Position 5-8: `1010` (Stage: Add, Update)
  - Position 9-12: `1010` (Substage: Add, Update)

**Steps to Set:**
1. Toggle ON "Project Management"
2. Check Add and Update checkboxes for all three sub-options
3. Leave Read and Delete unchecked
4. Save

**Expected UI After Login:**
- ✅ "Add Project" button visible
- ❌ Project list table may not be visible (no read access)
- ✅ "Edit Project" button visible (if somehow accessed)
- ✅ "Edit Stage" button visible
- ✅ "Edit" button visible on substages
- ❌ Delete icons hidden

---

## Debugging Console Commands

### Check Access String in Console

Open Browser DevTools (F12) and run:

```javascript
// Get the Redux state
let state = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
  window.__REDUX_DEVTOOLS_EXTENSION__.store.getState() : null;

if (state) {
  console.log('=== ACCESS CONTROL DEBUG ===');
  console.log('Employee ID:', state.auth.user?.employeeId);
  console.log('Employee Name:', state.auth.user?.employeeName);
  console.log('Raw Access String:', state.auth.user?.employeeAccess);
  
  // Parse the access string
  const accessParts = (state.auth.user?.employeeAccess || '').split(',');
  console.log('Group 0 (HR):', accessParts[0]);
  console.log('Group 1 (Project):', accessParts[1]);
  console.log('Group 2 (Training):', accessParts[2]);
  console.log('Group 3 (Ticket):', accessParts[3]);
  
  // Parse Project Management access
  if (accessParts[1]) {
    const projectGroup = accessParts[1];
    console.log('=== PROJECT MANAGEMENT ===');
    console.log('Module Enabled:', projectGroup[0] === '1');
    console.log('Project Add:', projectGroup[1] === '1');
    console.log('Project Read:', projectGroup[2] === '1');
    console.log('Project Update:', projectGroup[3] === '1');
    console.log('Project Delete:', projectGroup[4] === '1');
    console.log('Stage Add:', projectGroup[5] === '1');
    console.log('Stage Read:', projectGroup[6] === '1');
    console.log('Stage Update:', projectGroup[7] === '1');
    console.log('Stage Delete:', projectGroup[8] === '1');
    console.log('Substage Add:', projectGroup[9] === '1');
    console.log('Substage Read:', projectGroup[10] === '1');
    console.log('Substage Update:', projectGroup[11] === '1');
    console.log('Substage Delete:', projectGroup[12] === '1');
  }
} else {
  console.log('Redux DevTools not available. Try: localStorage.getItem("persist:root")');
}
```

### Check Parsed Project Access

Add this temporarily to any component like `MyProject.jsx`:

```javascript
import { getProjectManagementAccess } from '../../../utils/projectAccess.js'

// Inside component
const employeeAccess = useSelector((state) => state.auth.user?.employeeAccess)
const projectAccess = getProjectManagementAccess(employeeAccess)

useEffect(() => {
  console.log('=== PROJECT ACCESS PARSED ===');
  console.log('Raw Access:', employeeAccess);
  console.log('Parsed Access:', projectAccess);
  console.log('Module Enabled:', projectAccess.moduleEnabled);
  console.log('Project:', projectAccess.project);
  console.log('Stage:', projectAccess.stage);
  console.log('Substage:', projectAccess.substage);
}, [employeeAccess, projectAccess]);
```

---

## Common Issues and Fixes

### Issue 1: Access String is All Zeros

**Problem:** Access string looks like `0000...,0000...,0000...,0000...`

**Causes:**
1. The toggle switch for Project Management was not turned ON
2. The access string was not saved to the database
3. The employee record doesn't have the access string

**Fix:**
1. Re-edit the employee
2. Toggle Project Management ON (should turn blue)
3. Check at least one checkbox
4. Save and verify in database

**SQL Check:**
```sql
SELECT employeeId, employeeName, employeeAccess 
FROM employees 
WHERE employeeEmail = 'your.email@example.com';
```

---

### Issue 2: Access String Has Wrong Format

**Problem:** Access string has incorrect number of characters per group

**Expected Format:**
```
[13 chars],[13 chars],[25 chars],[10 chars]
```

**Example Valid String:**
```
0000000000000,1111111111111,0000000000000000000000000,0000000000
```

**Cause:** Bug in AccessTable.jsx (now fixed) - was padding to 52 chars instead of correct lengths

**Fix:** The fix has been applied. Re-edit the employee and save again to generate correct format.

---

### Issue 3: Buttons Still Not Showing

**Problem:** Access is set correctly but UI buttons still hidden

**Possible Causes:**

**A. Auth State Not Updated**
- User needs to log out and log back in
- Or refresh the page to reload Redux state

**B. Component Not Checking Access Properly**
- Check the component code for conditional rendering
- Look for: `{projectAccess.project.add && <button>Add</button>}`
- Verify the prop name matches exactly

**C. Multiple Access Checks**
- Some components check multiple permissions
- Example: `{(projectAccess.stage.update || projectAccess.substage.update) && ...}`
- Verify ALL required permissions are granted

---

### Issue 4: Database Not Saving Access String

**Problem:** Access string generated correctly but not persisted

**Check Backend:**

File: `backend/controllers/employee.controller.js`

Look for the ADD/UPDATE employee functions and verify `employeeAccess` is included:

```javascript
// ADD Employee
const query = `
  INSERT INTO employees 
  (customEmployeeId, employeeName, employeeEmail, employeeAccess, ...) 
  VALUES (?, ?, ?, ?, ...)
`;

// UPDATE Employee
const query = `
  UPDATE employees 
  SET employeeName = ?, employeeAccess = ?, ... 
  WHERE employeeId = ?
`;
```

If `employeeAccess` is missing from the query, add it.

---

## Step-by-Step Verification

### Step 1: Set Access

1. Navigate to HR Management → Employees
2. Edit an employee (or add new)
3. Scroll to "Manage Access"
4. Toggle "Project Management" ON
5. Check all boxes for Project, Stage, and Substage
6. Open Browser Console (F12)
7. Click "Save"
8. Look for console log: `Updated Access String: 0000000000000,1111111111111,0000000000000000000000000,0000000000`
9. Verify Group 1 (Project) is: `1111111111111`

### Step 2: Verify Database

Run this SQL query:
```sql
SELECT employeeId, employeeName, employeeEmail, employeeAccess 
FROM employees 
WHERE employeeId = [THE_EMPLOYEE_ID];
```

Expected `employeeAccess` column value:
```
0000000000000,1111111111111,0000000000000000000000000,0000000000
```

### Step 3: Login as Employee

1. Log out current user
2. Log in with the employee account
3. Open Browser Console (F12)
4. Run the "Check Access String in Console" script above
5. Verify all permissions show as `true`

### Step 4: Check UI Elements

Navigate through the application and verify:

| Page | Element | Should Show |
|------|---------|-------------|
| All Projects | "Add Project" button | ✅ Yes |
| All Projects | Project list table | ✅ Yes |
| Project Details | "Edit Project" button | ✅ Yes |
| Project Details | Stage cards | ✅ Yes |
| Project Details | "Edit Stage" button | ✅ Yes |
| Project Details | Stage progress edit | ✅ Yes |
| Stage Details | "Edit Stage" button | ✅ Yes |
| Stage Details | Substage tree | ✅ Yes |
| Stage Details | Substage "Edit" button | ✅ Yes |
| Stage Details | Substage checkbox | ✅ Yes |
| Stage Details | Substage progress edit | ✅ Yes |

---

## What Was Fixed

### Fix 1: Access String Length

**Problem:** AccessTable.jsx was padding all modules to 52 characters

**Before:**
```javascript
return bits.join('').padEnd(52, '0');
```

**After:**
```javascript
const getModuleLength = (module) => {
  if (module === 'TicketTracking') return 10;
  else if (module === 'TrainingManagement') return 25;
  else return 13; // HRManagement and ProjectManagement
};
return bits.join('').padEnd(requiredLength, '0');
```

**Result:** Now generates correct length strings:
- HR: 13 chars
- Project: 13 chars
- Training: 25 chars
- Ticket: 10 chars

---

## Contact for Support

If the issue persists after following all steps:

1. Export the following information:
   - Employee ID
   - Raw access string from database
   - Console output from debug scripts
   - Screenshots of UI (what should show vs what shows)

2. Check:
   - Browser console for errors
   - Network tab for failed API calls
   - Redux DevTools for state issues

---

**Last Updated:** After fixing AccessTable.jsx padding issue
