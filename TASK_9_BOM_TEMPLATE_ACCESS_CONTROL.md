# Task 9: BOM and Stage Template Access Control Implementation

**Date**: July 18, 2026  
**Status**: ✅ COMPLETED  
**Feature**: Implemented access control for BOM Management and Stage Template Management in Project Management section

---

## Overview

Added comprehensive CRUD (Create, Read, Update, Delete) access controls for two new sub-modules in Project Management:
1. **BOM Management** - Control access to Bill of Materials features
2. **Stage Template Management** - Control access to reusable stage templates

---

## Changes Made

### 1. Updated Access String Structure

**Previous Project Management Structure:**
```
Position:  0   1234   5678   9 10 11 12
           M  [Proj]  [Stag] [Subs]
           
Length: 13 characters
```

**New Project Management Structure:**
```
Position:  0   1234   5678   9 10 11 12  13 14 15 16  17 18 19 20
           M  [Proj]  [Stag] [Subs ]  [BOM  ]  [Templ]
           │   ARUD   ARUD   ARUD    ARUD    ARUD

M = Module Enabled
A = Add
R = Read
U = Update  
D = Delete

Length: 21 characters (was 13)
```

### 2. Files Modified

| File | Change | Description |
|------|--------|-------------|
| `frontend/src/pages/employee/AccessTable.jsx` | Modified | Added BOM and Template to ProjectManagement sub-options |
| `frontend/src/pages/employee/AccessDisplay.jsx` | Modified | Added BOM and Template to display |
| `frontend/src/utils/projectAccess.js` | Modified | Added BOM and Template parsing (bits 13-20) |
| `frontend/src/components/Project/Templates/AllTemplates.jsx` | Modified | Applied access controls to template CRUD operations |
| `frontend/src/pages/BOM/BOMProject/BomProject.jsx` | Modified | Applied access controls to BOM project list |
| `frontend/src/pages/BOM/BOMPage/BomPage.jsx` | Modified | Applied access controls to BOM CRUD operations |

---

## Access String Format

### Complete Format

```
[HR 13 chars],[Project 21 chars],[Training 25 chars],[Ticket 10 chars]
```

**Example - Full Access:**
```
0000000000000,111111111111111111111,0000000000000000000000000,0000000000
              └─ Project Mgmt ──┘
```

### Project Management Breakdown

**Position Mapping:**
- **0**: Module enabled (1=on, 0=off)
- **1-4**: Project Management (Add, Read, Update, Delete)
- **5-8**: Stage Management (Add, Read, Update, Delete)
- **9-12**: Substage Management (Add, Read, Update, Delete)
- **13-16**: BOM Management (Add, Read, Update, Delete)
- **17-20**: Stage Template Management (Add, Read, Update, Delete)

**Example Access Strings:**

| Scenario | Access String | Description |
|----------|---------------|-------------|
| Full Access | `111111111111111111111` | All permissions for all sub-modules |
| Read Only | `101010101010101010101` | Only Read enabled for all |
| BOM Only | `100000000000111100000` | Full BOM access, no other access |
| Template Only | `100000000000000001111` | Full Template access, no other access |
| Module Disabled | `000000000000000000000` | Entire Project Management off |

---

## Implementation Details

### 1. AccessTable.jsx Updates

**Added Sub-Options:**
```javascript
const subOptions = {
    ProjectManagement: [
        'Project Management',
        'Stage Management', 
        'Substage Management',
        'BOM Management',           // NEW
        'Stage Template Management'  // NEW
    ],
    // ...
};
```

**Updated Length Calculation:**
```javascript
const getModuleLength = (module) => {
    if (module === 'ProjectManagement') {
        // 1 module flag + (5 sub-options × 4 bits) = 21 bits
        return 21;
    }
    // ...
};
```

### 2. projectAccess.js Updates

**Added BOM and Template Parsing:**
```javascript
export const getProjectManagementAccess = (employeeAccess = '') => {
  const projectSegment = (employeeAccess.split(',')[1] || '').trim().padEnd(21, '0')
  const moduleEnabled = projectSegment[0] === '1'

  if (!moduleEnabled) {
    return {
      moduleEnabled: false,
      project: createCrudFlags(),
      stage: createCrudFlags(),
      substage: createCrudFlags(),
      bom: createCrudFlags(),      // NEW
      template: createCrudFlags(),  // NEW
    }
  }

  return {
    moduleEnabled,
    project: createCrudFlags(projectSegment, 1),      // Bits 1-4
    stage: createCrudFlags(projectSegment, 5),        // Bits 5-8
    substage: createCrudFlags(projectSegment, 9),     // Bits 9-12
    bom: createCrudFlags(projectSegment, 13),         // Bits 13-16 (NEW)
    template: createCrudFlags(projectSegment, 17),    // Bits 17-20 (NEW)
  }
}
```

**Returns:**
```javascript
{
  moduleEnabled: true,
  project: { add, read, update, delete },
  stage: { add, read, update, delete },
  substage: { add, read, update, delete },
  bom: { add, read, update, delete },      // NEW
  template: { add, read, update, delete }  // NEW
}
```

### 3. Stage Template Access Control

**AllTemplates.jsx:**
- **Add Access**: "Create Template" button only shows with `template.add`
- **Read Access**: Template list only shows with `template.read`
- **Update Access**: Edit button only shows with `template.update`
- **Delete Access**: Delete button only shows with `template.delete`

```javascript
import { getProjectManagementAccess } from '../../../utils/projectAccess.js'

const projectAccess = getProjectManagementAccess(employeeAccess)

// Create Template button
{projectAccess.template.add && (
  <button onClick={() => navigate('/addTemplate')}>
    Create Template
  </button>
)}

// Template list display
{projectAccess.template.read ? (
  <div className="templates-grid">
    {templates.map((template) => (
      <div className="template-card">
        {/* Edit button */}
        {projectAccess.template.update && (
          <button onClick={() => navigate(`/editTemplate/${template.templateId}`)}>
            Edit
          </button>
        )}
        {/* Delete button */}
        {projectAccess.template.delete && (
          <button onClick={() => handleDelete(template.templateId)}>
            Delete
          </button>
        )}
      </div>
    ))}
  </div>
) : (
  <div>You do not have read access for Stage Template Management.</div>
)}
```

### 4. BOM Access Control

**BomProject.jsx (Project List):**
- **Read Access**: Project list only shows with `bom.read`

```javascript
import { getProjectManagementAccess } from '../../../utils/projectAccess.js'

const projectAccess = getProjectManagementAccess(employeeAccess)

{projectAccess.bom.read ? (
  <TableComponent rows={filteredProjects} columns={columns} />
) : (
  <div>You do not have read access for BOM Management.</div>
)}
```

**BomPage.jsx (BOM Details):**
- **Add Access**: "Add Item", "Import", "Import Excel", "Download Template" buttons
- **Read Access**: Export button, view BOM items
- **Update Access**: Edit buttons in table
- **Delete Access**: Delete buttons in table

```javascript
import { getProjectManagementAccess } from '../../../utils/projectAccess.js'

const projectAccess = getProjectManagementAccess(employeeAccess)

// Import buttons (require Add access)
{projectAccess.bom.add && (
  <>
    <button onClick={() => setImportOpen(true)}>Import</button>
    <button onClick={() => setExcelImportOpen(true)}>Import Excel</button>
    <button onClick={handleDownloadTemplate}>Download Template</button>
  </>
)}

// Export button (requires Read access)
{projectAccess.bom.read && (
  <button onClick={handleExportExcel}>Export Excel</button>
)}

// Add Item button
{!showAddForm && view === "designer" && projectAccess.bom.add && (
  <button onClick={() => setShowAddForm(true)}>Add Item</button>
)}

// Add form
{showAddForm && projectAccess.bom.add && (
  <AddBOM />
)}

// Table with edit/delete controls
<TableComponent
  rows={filteredBom}
  columns={columns}
  setTriggerEdit={projectAccess.bom.update ? setTriggerEdit : null}
  handleDeleteButton={projectAccess.bom.delete ? handleDelete : null}
/>
```

---

## Permission Matrix

### Stage Template Management

| Permission | UI Element | Location |
|-----------|------------|----------|
| **Add** | "Create Template" button | AllTemplates page |
| **Read** | Template list display | AllTemplates page |
| **Update** | Edit button (per template) | Template card |
| **Delete** | Delete button (per template) | Template card |

### BOM Management

| Permission | UI Element | Location |
|-----------|------------|----------|
| **Add** | "Add Item" button | BOM Page |
| **Add** | "Import" button | BOM Page header |
| **Add** | "Import Excel" button | BOM Page header |
| **Add** | "Download Template" button | BOM Page header |
| **Read** | Project list table | BOM Project page |
| **Read** | "Export Excel" button | BOM Page header |
| **Read** | View BOM items | BOM Page |
| **Update** | Edit icon (per BOM item) | BOM table |
| **Delete** | Delete icon (per BOM item) | BOM table |

---

## Testing Instructions

### Test 1: Full Access to BOM and Template

**Setup:**
1. Go to HR Management → Employees → Edit Employee
2. Toggle "Project Management" ON
3. Check ALL boxes for:
   - BOM Management: ✓ Add, ✓ Read, ✓ Update, ✓ Delete
   - Stage Template Management: ✓ Add, ✓ Read, ✓ Update, ✓ Delete
4. Save

**Expected Access String (Group 1):**
```
111111111111111111111
                └─ BOM & Template ─┘
```

**Login and verify:**

**Stage Templates:**
- ✅ "Create Template" button visible
- ✅ Template list visible
- ✅ Edit button visible on templates
- ✅ Delete button visible on templates

**BOM:**
- ✅ Can access BOM project list
- ✅ "Add Item" button visible
- ✅ "Import" buttons visible
- ✅ "Export Excel" button visible
- ✅ Edit icon visible on BOM items
- ✅ Delete icon visible on BOM items

### Test 2: Read-Only Access

**Setup:**
1. Check ONLY "Read" for BOM and Template
2. Save

**Expected Access String (Group 1):**
```
100000000000010001000
                └─ BOM & Template Read Only ─┘
```

**Login and verify:**

**Stage Templates:**
- ❌ "Create Template" button hidden
- ✅ Template list visible
- ❌ Edit button hidden
- ❌ Delete button hidden

**BOM:**
- ✅ Can view BOM project list
- ❌ "Add Item" button hidden
- ❌ "Import" buttons hidden
- ✅ "Export Excel" button visible
- ❌ Edit icon hidden
- ❌ Delete icon hidden

### Test 3: No Access

**Setup:**
1. Uncheck ALL boxes for BOM and Template
2. Save

**Expected Access String (Group 1):**
```
111111111100000000000
          └─ BOM & Template No Access ─┘
```

**Login and verify:**

**Stage Templates:**
- ❌ Cannot see templates (access denied message)

**BOM:**
- ❌ Cannot see BOM projects (access denied message)

### Test 4: BOM Only Access

**Setup:**
1. Check ALL boxes for BOM Management
2. Uncheck ALL for Template Management
3. Save

**Expected Access String (Group 1):**
```
111111111111111100000
          └─ BOM only ─┘
```

**Login and verify:**
- ✅ Full BOM access
- ❌ No template access

---

## Backward Compatibility

### For Existing Employees

Employees with existing access strings will have their strings padded automatically:

**Old Format (13 chars):**
```
1111111111111
```

**Auto-padded to New Format (21 chars):**
```
111111111111100000000
                └─ BOM & Template: No access (padded with zeros)
```

### Migration Steps

1. **Re-edit employees** who need BOM or Template access
2. **Set permissions** in AccessTable
3. **Save** to generate new 21-character access string

---

## Access String Examples

### Example 1: Full Project Management Access
```
Access String: 0000000000000,111111111111111111111,0000000000000000000000000,0000000000

Breakdown:
- Module: Enabled (1)
- Project: Full access (1111)
- Stage: Full access (1111)
- Substage: Full access (1111)
- BOM: Full access (1111)
- Template: Full access (1111)
```

### Example 2: Designer Access (No Template)
```
Access String: 0000000000000,111111111111111110000,0000000000000000000000000,0000000000

Breakdown:
- Project, Stage, Substage, BOM: Full access
- Template: No access
```

### Example 3: Manager Access (Read All, Edit Project/Stage)
```
Access String: 0000000000000,110111011010101010101,0000000000000000000000000,0000000000

Breakdown:
- Project: Add, Read, Update (1101)
- Stage: Add, Read, Update (1101)
- Substage: Read only (0100)
- BOM: Read only (0100)
- Template: Read only (0100)
```

---

## Debugging Guide

### Check Access String

**Browser Console:**
```javascript
let state = window.__REDUX_DEVTOOLS_EXTENSION__.store.getState();
const projectSegment = state.auth.user?.employeeAccess.split(',')[1];

console.log('Project Segment:', projectSegment);
console.log('Length:', projectSegment.length); // Should be 21

// Parse BOM access
console.log('BOM Add:', projectSegment[13] === '1');
console.log('BOM Read:', projectSegment[14] === '1');
console.log('BOM Update:', projectSegment[15] === '1');
console.log('BOM Delete:', projectSegment[16] === '1');

// Parse Template access
console.log('Template Add:', projectSegment[17] === '1');
console.log('Template Read:', projectSegment[18] === '1');
console.log('Template Update:', projectSegment[19] === '1');
console.log('Template Delete:', projectSegment[20] === '1');
```

### Check Parsed Access

```javascript
import { getProjectManagementAccess } from '../../../utils/projectAccess.js'

const projectAccess = getProjectManagementAccess(employeeAccess)

console.log('BOM Access:', projectAccess.bom)
// { add: true, read: true, update: true, delete: true }

console.log('Template Access:', projectAccess.template)
// { add: true, read: true, update: true, delete: true }
```

---

## Common Issues

### Issue 1: Old Access String Format

**Problem:** Employees created before this update have 13-character Project Management strings

**Solution:**
- Re-edit each employee
- Re-save to regenerate 21-character string

### Issue 2: BOM/Template Not Showing

**Cause:** Module disabled or no read access

**Check:**
1. Verify Project Management module is enabled (position 0 = '1')
2. Verify BOM read (position 14 = '1') or Template read (position 18 = '1')

### Issue 3: Buttons Still Showing

**Cause:** Need to log out and log back in

**Solution:**
- Log out completely
- Log back in to reload Redux state

---

## Success Criteria

✅ **AccessTable updated with BOM and Template sub-options**  
✅ **Access string length increased from 13 to 21 characters**  
✅ **projectAccess.js utility updated to parse BOM and Template**  
✅ **Template page has CRUD access controls**  
✅ **BOM pages have CRUD access controls**  
✅ **Buttons show/hide based on permissions**  
✅ **Backward compatible with old access strings**  

---

## Related Documentation

- **Task 7**: Fixed Project Management access control (base system)
- **Task 8**: Fixed HR Management access control (same pattern)
- **QUICK_REFERENCE_ACCESS_CONTROL.md**: Quick access format reference

---

**Task Status:** ✅ COMPLETED  
**Files Modified:** 6  
**New Sub-modules:** 2 (BOM, Stage Template)  
**Testing Required:** Yes  
**Ready for Deployment:** Yes (after testing)

---

**End of Task 9 Documentation**
