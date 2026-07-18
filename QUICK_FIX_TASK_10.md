# Quick Fix - Task 10: Read + Update Permission Issue

**Status**: ✅ FIXED  
**Issue**: Employees with Read + Update permissions couldn't edit items

---

## Problem

When employee had only **Read + Update** permissions (no Add):
- ❌ BOM: Couldn't edit items (form wouldn't show)
- ❌ Templates: Could access edit route but no permission check

---

## Root Cause

Forms used for both ADD and EDIT, but visibility checked only ADD permission:

```javascript
// ❌ WRONG
{showForm && addPermission && <FormComponent />}
```

---

## Solution

Check BOTH permissions:

```javascript
// ✅ CORRECT
{showForm && (addPermission || updatePermission) && <FormComponent />}
```

---

## Files Fixed

1. **BomPage.jsx** - Line ~258
   ```javascript
   // Before
   {showAddForm && projectAccess.bom.add && <AddBOM />}
   
   // After
   {showAddForm && (projectAccess.bom.add || projectAccess.bom.update) && <AddBOM />}
   ```

2. **TemplateForm.jsx** - Added access control
   ```javascript
   const hasRequiredPermission = isEdit 
     ? projectAccess.template.update 
     : projectAccess.template.add
   
   if (!hasRequiredPermission) {
     return <AccessDenied />
   }
   ```

---

## Testing

**Setup:** Give Read + Update only (uncheck Add and Delete)

**Expected:**
- ✅ Can view items
- ❌ "Add" button hidden
- ✅ "Edit" button visible  
- ✅ Can click edit and form shows ← **This was broken**
- ✅ Can save changes ← **This was broken**
- ❌ "Delete" button hidden

---

**Full Documentation:** See `TASK_10_FIX_READ_UPDATE_PERMISSION.md`
