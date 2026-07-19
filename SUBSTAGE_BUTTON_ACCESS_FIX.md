# Substage Add/Delete Button Access Control Fix

## Problem
When an admin removed access for "Add" or "Delete" permissions for substages, the plus (+) button and delete button were still visible in the substage tree view. Although the buttons were non-functional (backend would reject the actions), they should not be displayed at all when the user lacks the corresponding permissions.

## Root Cause
The `SubstageTreeNode` component was receiving a single boolean `employeeAccess` prop that checked if ANY permission (add, update, or delete) was granted. This meant:
- If user had only "Update" permission → All buttons (add, edit, delete) were shown
- If user had only "Add" permission → All buttons were shown
- If user had only "Delete" permission → All buttons were shown

The component couldn't distinguish between specific permissions.

## Solution
Changed from a single boolean to specific permission props:
- `canAdd` - Controls visibility of the plus (+) button
- `canDelete` - Controls visibility of the delete button
- `onEdit` prop already controlled the edit button (update permission)

## Changes Made

### 1. MyStage.jsx
**File**: `frontend/src/components/Project/MyStage/MyStage.jsx`

**Before**:
```jsx
<SubstageTreeNode
  ...
  employeeAccess={
    projectAccess.substage.add ||
    projectAccess.substage.update ||
    projectAccess.substage.delete
  }
/>
```

**After**:
```jsx
<SubstageTreeNode
  ...
  canAdd={projectAccess.substage.add}
  canDelete={projectAccess.substage.delete}
/>
```

### 2. UpdateProject.jsx
**File**: `frontend/src/components/Project/UpdateProject/UpdateProject.jsx`

**Before**:
```jsx
<SubstageTreeNode
  ...
  employeeAccess={
    projectAccess.substage.add ||
    projectAccess.substage.update ||
    projectAccess.substage.delete
  }
/>
```

**After**:
```jsx
<SubstageTreeNode
  ...
  canAdd={projectAccess.substage.add}
  canDelete={projectAccess.substage.delete}
/>
```

### 3. SubstageTreeNode.jsx
**File**: `frontend/src/components/common/SubstageTreeNode/SubstageTreeNode.jsx`

**Component Props - Before**:
```jsx
const SubstageTreeNode = ({
  ...
  employeeAccess,
}) => {
```

**Component Props - After**:
```jsx
const SubstageTreeNode = ({
  ...
  canAdd = false,
  canDelete = false,
}) => {
```

**Render Logic - Before**:
```jsx
<div className="tree-node-actions">
  {employeeAccess && (
    <>
      {onAddChild && (
        <button className="tree-action-btn add" ...>
          <FiPlusCircle size={16} />
        </button>
      )}
      {onEdit && (
        <button className="tree-action-btn edit" ...>
          <FiEdit2 size={16} />
        </button>
      )}
      {onDelete && (
        <button className="tree-action-btn delete" ...>
          <RiDeleteBinLine size={16} />
        </button>
      )}
    </>
  )}
</div>
```

**Render Logic - After**:
```jsx
<div className="tree-node-actions">
  {canAdd && onAddChild && (
    <button className="tree-action-btn add" ...>
      <FiPlusCircle size={16} />
    </button>
  )}
  {onEdit && (
    <button className="tree-action-btn edit" ...>
      <FiEdit2 size={16} />
    </button>
  )}
  {canDelete && onDelete && (
    <button className="tree-action-btn delete" ...>
      <RiDeleteBinLine size={16} />
    </button>
  )}
</div>
```

**Recursive Call - Updated**:
```jsx
<SubstageTreeNode
  ...
  canAdd={canAdd}
  canDelete={canDelete}
/>
```

## Button Visibility Matrix

| Permission | Add Button (+) | Edit Button | Delete Button |
|------------|----------------|-------------|---------------|
| None | Hidden | Hidden | Hidden |
| Add only | Visible | Hidden | Hidden |
| Update only | Hidden | Visible | Hidden |
| Delete only | Hidden | Hidden | Visible |
| Add + Update | Visible | Visible | Hidden |
| Add + Delete | Visible | Hidden | Visible |
| Update + Delete | Hidden | Visible | Visible |
| All | Visible | Visible | Visible |

## Access Control Flow

1. **Admin sets permissions** in HR Management → Employee → Edit → Manage Access
2. **Access stored** in database as `employeeAccess` string (e.g., "0000000000000,11111111111111111111,0000000000000000000000000,0000000000")
3. **Frontend parses** access string using `getProjectManagementAccess()` utility
4. **Component receives** specific boolean flags: `canAdd`, `canDelete`
5. **Buttons render** only when corresponding permission is `true`
6. **Backend validates** on every action (defense in depth)

## Testing

### Test Case 1: Remove Add Permission
1. Login as admin
2. Go to employee → Edit → Project Management → Substage Management
3. Uncheck "Add" but keep "Update" and "Delete"
4. Save changes
5. Login as that employee
6. Go to any project → Stage → View substages
7. **Expected**: Plus (+) button is hidden, Edit and Delete buttons are visible

### Test Case 2: Remove Delete Permission
1. Uncheck "Delete" but keep "Add" and "Update"
2. Save and test
3. **Expected**: Delete button is hidden, Add (+) and Edit buttons are visible

### Test Case 3: Remove Add and Delete
1. Uncheck both "Add" and "Delete", keep only "Update"
2. Save and test
3. **Expected**: Only Edit button is visible

### Test Case 4: Remove All Permissions
1. Uncheck all substage permissions
2. Save and test
3. **Expected**: No action buttons visible, substages are read-only

## Benefits

1. **Clear UI**: Users only see actions they can perform
2. **Better UX**: No confusion from non-functional buttons
3. **Security**: Visual reinforcement of access control
4. **Consistency**: Matches access control in other parts of the app
5. **Maintainability**: Specific props are easier to understand than boolean logic

## Files Modified

1. `frontend/src/components/Project/MyStage/MyStage.jsx`
2. `frontend/src/components/Project/UpdateProject/UpdateProject.jsx`
3. `frontend/src/components/common/SubstageTreeNode/SubstageTreeNode.jsx`

## Backend Security

Note: Even though buttons are hidden, backend still validates permissions on every API call:
- `POST /api/substages` - Checks add permission
- `PUT /api/substages/:id` - Checks update permission
- `DELETE /api/substages/:id` - Checks delete permission

This provides defense-in-depth: UI hides buttons, backend enforces rules.

## Related Changes

This fix complements the real-time access update feature:
- When admin changes permissions, buttons disappear within 10 seconds
- No page refresh needed
- User sees toast notification when permissions change

## Future Enhancements

1. Add tooltips explaining why buttons are hidden
2. Show lock icon for restricted actions
3. Add access summary at top of page
4. Implement role-based templates for common permission sets
