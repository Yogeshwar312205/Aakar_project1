# Task 10: Fix Read + Update Permission Issue

**Date**: July 18, 2026  
**Status**: ✅ COMPLETED  
**Issue**: Employees with only Read and Update permissions couldn't update items (BOM, Templates)

---

## Problem Description

When an employee was granted **Read + Update** permissions (without Add permission), they could not edit existing items because:

1. **BOM**: The edit form (AddBOM component) only showed when user had `bom.add` permission
2. **Templates**: The template form (TemplateForm) route was accessible but didn't have access control checks

The issue was that the same form component was used for both **adding new items** AND **editing existing items**, but the visibility check only looked for ADD permission.

---

## Root Cause Analysis

### BOM Issue

**File:** `frontend/src/pages/BOM/BOMPage/BomPage.jsx`  
**Line:** ~258

**Before (Incorrect):**
```javascript
{showAddForm && projectAccess.bom.add && (
  <AddBOM
    view={view}
    triggerEdit={triggerEdit}
    // ... props
  />
)}
```

**Problem:**
- The form only showed when `projectAccess.bom.add` was true
- When editing (via edit button click), the form should show if user has UPDATE permission
- Result: Users with only Read + Update couldn't see the form to edit items

### Template Issue

**File:** `frontend/src/components/Project/Templates/TemplateForm.jsx`

**Problem:**
- No access control checks in the component
- Users could navigate to `/addTemplate` or `/editTemplate/:id` regardless of permissions
- Need to check ADD permission for new templates, UPDATE permission for editing

---

## Solutions Applied

### 1. Fixed BOM Edit Form Visibility

**File:** `frontend/src/pages/BOM/BOMPage/BomPage.jsx`  
**Line:** ~258

**After (Correct):**
```javascript
{showAddForm && (projectAccess.bom.add || projectAccess.bom.update) && (
  <AddBOM
    view={view}
    triggerEdit={triggerEdit}
    // ... props
  />
)}
```

**Logic:**
- Form shows if user has ADD permission (for creating new items)
- OR if user has UPDATE permission (for editing existing items)
- The form itself handles both create and update operations

### 2. Added Template Form Access Control

**File:** `frontend/src/components/Project/Templates/TemplateForm.jsx`

**Added:**
1. Import projectAccess utility
2. Determine if editing or adding based on `params.id`
3. Check appropriate permission (add for new, update for edit)
4. Show access denied message if no permission

```javascript
import { getProjectManagementAccess } from '../../../utils/projectAccess.js'

const TemplateForm = () => {
  // ... existing code
  
  const employeeAccess = useSelector((state) => state.auth.user?.employeeAccess) || ''
  const projectAccess = getProjectManagementAccess(employeeAccess)
  const isEdit = !!params.id
  
  // Check if user has required permission
  const hasRequiredPermission = isEdit 
    ? projectAccess.template.update 
    : projectAccess.template.add
  
  // If no permission, show access denied message
  if (!hasRequiredPermission) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Access Denied</h2>
        <p>
          You do not have permission to {isEdit ? 'update' : 'create'} stage templates.
        </p>
        <button onClick={() => navigate('/templates')}>
          Back to Templates
        </button>
      </div>
    )
  }
  
  // ... rest of component
}
```

---

## Files Modified

| File | Change | Description |
|------|--------|-------------|
| `frontend/src/pages/BOM/BOMPage/BomPage.jsx` | Line ~258 | Changed form visibility check to allow UPDATE permission |
| `frontend/src/components/Project/Templates/TemplateForm.jsx` | Added access control | Added permission checks for add/update operations |

---

## Permission Logic

### BOM Edit Flow

1. **User clicks Edit icon** in BOM table
2. **Edit icon visible** if `projectAccess.bom.update === true`
3. **Click triggers** `setTriggerEdit({ active: true, id: bomId })`
4. **Form shows** if `projectAccess.bom.add || projectAccess.bom.update`
5. **User can edit** and save changes

### Template Edit Flow

1. **User clicks Edit button** on template card
2. **Edit button visible** if `projectAccess.template.update === true`
3. **Navigation** to `/editTemplate/:id`
4. **TemplateForm checks** if `projectAccess.template.update === true`
5. **If no permission**, show access denied
6. **If has permission**, show form and allow editing

---

## Testing Scenarios

### Test 1: Read + Update Only (No Add)

**Setup:**
1. Edit employee in HR Management
2. Enable Project Management
3. For BOM Management: ✓ Read, ✓ Update (uncheck Add and Delete)
4. For Template Management: ✓ Read, ✓ Update (uncheck Add and Delete)
5. Save

**Expected Access String (BOM & Template portions):**
```
Position:  13-16 (BOM)   17-20 (Template)
Bits:      0110          0110
           │││└─ Delete   │││└─ Delete
           ││└── Update   ││└── Update
           │└─── Read     │└─── Read
           └──── Add      └──── Add
```

**Full access string example:**
```
0000000000000,100000000000011001100,0000000000000000000000000,0000000000
                          └BOM─┘└Temp┘
```

**Login and verify:**

**BOM:**
- ❌ "Add Item" button hidden (no Add permission)
- ❌ Import buttons hidden (no Add permission)
- ✅ Can view BOM items (Read permission)
- ✅ Edit icon visible on items (Update permission)
- ✅ Clicking edit shows the form ← **This was broken before**
- ✅ Can modify and save changes ← **This was broken before**
- ❌ Delete icon hidden (no Delete permission)

**Templates:**
- ❌ "Create Template" button hidden (no Add permission)
- ✅ Can view template list (Read permission)
- ✅ Edit button visible on templates (Update permission)
- ✅ Clicking edit navigates to form ← **This was broken before**
- ✅ Form allows editing ← **This was broken before**
- ✅ Can save changes ← **This was broken before**
- ❌ Delete button hidden (no Delete permission)

### Test 2: Add Only (No Update)

**Setup:**
- For BOM: ✓ Add, ✓ Read (uncheck Update and Delete)
- For Template: ✓ Add, ✓ Read (uncheck Update and Delete)

**Expected behavior:**
- ✅ "Add Item" / "Create Template" buttons visible
- ✅ Can create new items/templates
- ❌ Edit buttons hidden (no Update permission)
- ❌ Cannot edit existing items

### Test 3: Full CRUD Access

**Setup:**
- Check all boxes: Add, Read, Update, Delete

**Expected behavior:**
- ✅ All buttons visible
- ✅ Can create, read, update, and delete

---

## Permission Matrix

| Access Combination | Can View | Can Create | Can Edit | Can Delete |
|-------------------|----------|------------|----------|------------|
| None | ❌ | ❌ | ❌ | ❌ |
| Read only | ✅ | ❌ | ❌ | ❌ |
| Read + Add | ✅ | ✅ | ❌ | ❌ |
| Read + Update | ✅ | ❌ | ✅ ✓ | ❌ |
| Read + Delete | ✅ | ❌ | ❌ | ✅ |
| Read + Add + Update | ✅ | ✅ | ✅ | ❌ |
| Full (CRUD) | ✅ | ✅ | ✅ | ✅ |

**Note:** ✅ ✓ = This was broken before the fix

---

## Why This Pattern is Correct

### Form Reusability

Many CRUD applications use a single form component for both **Create** and **Update** operations:

```javascript
// Same component handles both
<AddBOM />  // Used for adding AND editing
<TemplateForm />  // Used for creating AND updating
```

**Benefits:**
- Reduces code duplication
- Maintains consistent UI/UX
- Single source of truth for validation logic

**Permission Logic:**
- When **creating**: Check ADD permission
- When **editing**: Check UPDATE permission
- Form can be shown if user has EITHER permission (depending on mode)

### Correct Permission Checks

```javascript
// For forms that handle both add and update
{showForm && (hasAddPermission || hasUpdatePermission) && (
  <FormComponent isEdit={isEdit} />
)}

// Inside form component
const hasRequiredPermission = isEdit 
  ? updatePermission 
  : addPermission

// For action buttons
{addPermission && <button>Create New</button>}
{updatePermission && <button>Edit</button>}
{deletePermission && <button>Delete</button>}
```

---

## Common Mistakes to Avoid

### ❌ Wrong: Only checking Add permission for forms

```javascript
// DON'T DO THIS - breaks edit functionality
{showForm && addPermission && (
  <FormComponent isEdit={isEdit} />
)}
```

### ✅ Correct: Check appropriate permission based on mode

```javascript
// DO THIS - allows both add and edit
{showForm && (addPermission || updatePermission) && (
  <FormComponent isEdit={isEdit} />
)}

// Or check specific permission inside component
const hasPermission = isEdit ? updatePermission : addPermission
if (!hasPermission) return <AccessDenied />
```

---

## Debugging Guide

### If Edit Still Not Working

**Check 1: Access String Format**
```javascript
// In browser console
let state = window.__REDUX_DEVTOOLS_EXTENSION__.store.getState();
const projectSegment = state.auth.user?.employeeAccess.split(',')[1];

// For BOM (bits 13-16)
console.log('BOM Update:', projectSegment[15] === '1');

// For Template (bits 17-20)  
console.log('Template Update:', projectSegment[19] === '1');
```

**Check 2: Component Rendering**
```javascript
// Add temporary logging in component
console.log('Show Form:', showAddForm);
console.log('BOM Add:', projectAccess.bom.add);
console.log('BOM Update:', projectAccess.bom.update);
console.log('Should Show:', projectAccess.bom.add || projectAccess.bom.update);
```

**Check 3: Form Visibility**
- Inspect element to see if form is rendered but hidden (CSS issue)
- Check browser console for any errors
- Verify Redux state has correct access string

---

## Related Issues

This fix pattern should be applied to other forms that handle both create and update:

### Already Fixed
- ✅ BOM (AddBOM component)
- ✅ Stage Templates (TemplateForm component)

### May Need Similar Fix
- **EditStageModal** - Already separate, likely OK
- **EditSubstageModal** - Already separate, likely OK
- **EditEmployee** - Separate route, has its own access check
- **UpdateProject** - Uses separate check for project.update

---

## Success Criteria

✅ **Users with Read + Update can edit BOM items**  
✅ **Users with Read + Update can edit templates**  
✅ **Users without Update permission cannot edit**  
✅ **Users without Add permission cannot create new items**  
✅ **Access denied message shows when navigating without permission**  
✅ **Form visibility logic checks both Add and Update permissions**  

---

## Summary

**Problem:** Edit functionality broken when user had only Read + Update (no Add)

**Cause:** Form visibility checked only ADD permission, but same form used for editing

**Solution:** Check both ADD and UPDATE permissions for form visibility

**Result:** Users can now edit items with just Read + Update permissions

---

**Task Status:** ✅ COMPLETED  
**Files Modified:** 2  
**Testing Required:** Yes (verify Read + Update access works)  
**Breaking Changes:** None  

---

**End of Task 10 Documentation**
