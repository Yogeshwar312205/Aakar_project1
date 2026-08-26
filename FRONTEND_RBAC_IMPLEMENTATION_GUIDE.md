# Frontend RBAC Implementation Guide

## Overview
This guide provides detailed instructions for implementing RBAC-aware UI components in the frontend. The backend is fully implemented and provides `canEdit` flags in all API responses.

## ✅ Completed: Task 12.1 - RBAC Utilities

**File Created:** `frontend/src/utils/rbacUtils.js`

### Available Utility Functions:

#### Permission Check Functions:
- `canEditStage(stage)` - Check if user can edit a stage
- `canEditSubstage(substage)` - Check if user can edit a substage
- `canAccessBOM(bomItem)` - Check if user can access/edit BOM data

#### Role Information:
- `extractRoleInfo(user, projectData)` - Extract role info from user/project data
- `isProjectManager(user, projectNumber, projectCreatedBy)` - Check if user is project manager
- `getRoleDisplayName(roleInfo)` - Get user-friendly role name

#### Access Control:
- `getEditableStages(stages)` - Filter stages user can edit
- `getEditableSubstages(substages)` - Filter substages user can edit
- `getEditableBOMItems(bomItems)` - Filter BOM items user can edit

#### UI Helpers:
- `isReadOnly(item)` - Check if item is read-only
- `getPermissionBadge(item)` - Get badge text ('Editable' or 'Read Only')

---

## 📋 Remaining Frontend Tasks

### Task 13: Modify Stage Components

#### 13.1 Update StageComponent for Permission-Aware Rendering

**Files to Modify:**
1. `frontend/src/components/Project/AddStage/StageComponent.jsx`
2. `frontend/src/components/Project/MyStage/MyStage.jsx`
3. `frontend/src/components/Project/ActivityTable/ActivityTable.jsx`
4. `frontend/src/components/Project/EditStage/EditStageModal.jsx`

**Changes Required:**

```javascript
// Import RBAC utilities
import { canEditStage, isReadOnly, getPermissionBadge } from '../../../utils/rbacUtils';

// In component render:
// 1. Check canEdit flag from API response
const editable = canEditStage(stage);

// 2. Conditionally render edit button
{editable && (
  <button onClick={handleEdit}>
    <EditIcon /> Edit
  </button>
)}

// 3. Display read-only badge
{isReadOnly(stage) && (
  <span className="badge-readonly">
    {getPermissionBadge(stage)}
  </span>
)}

// 4. Disable form inputs for read-only items
<input 
  type="text" 
  disabled={!editable}
  value={stageName}
/>
```

**Key Points:**
- Backend provides `canEdit: true/false` in API responses
- Use `canEditStage()` to check permissions
- Hide/disable edit buttons for read-only stages
- Show visual indicator (badge/lock icon) for read-only items

---

#### 13.2 Update Stage List/Table Components

**Files to Modify:**
1. `frontend/src/components/Project/AllProjects/AllProjects.jsx`
2. `frontend/src/components/Project/MyProject/MyProject.jsx`
3. `frontend/src/components/Project/ActivityTable/ActivityTable.jsx`

**Changes Required:**

```javascript
// Backend already filters stages - just display them
const displayStages = stages; // Backend filtered

// Show message when no stages available
{stages.length === 0 && (
  <div className="no-access-message">
    <InfoIcon />
    <p>You don't have access to any stages in this project.</p>
    <p>Contact the project manager for stage assignments.</p>
  </div>
)}

// Don't show "Create Stage" button for non-managers
{userIsManager && (
  <button onClick={openCreateStageModal}>
    <AddIcon /> Create Stage
  </button>
)}
```

**Key Points:**
- Backend filters stages automatically
- Display helpful message when user has no stage access
- Hide manager-only actions (create, delete) for non-managers

---

### Task 14: Modify Substage Components

#### 14.1 Update SubstageComponent for Permission-Aware Rendering

**Files to Modify:**
1. `frontend/src/components/Project/ActivityTable/SubPartComponent.jsx`
2. `frontend/src/components/Project/EditSubstage/EditSubstageModal.jsx`
3. `frontend/src/components/Project/AddSubstages/AddSubStage.jsx`

**Changes Required:**

```javascript
// Import RBAC utilities
import { canEditSubstage, isReadOnly, getPermissionBadge } from '../../../utils/rbacUtils';

// Check substage permissions
const editable = canEditSubstage(substage);

// Conditionally render edit controls
{editable ? (
  <button onClick={() => handleEditSubstage(substage)}>
    <EditIcon /> Edit
  </button>
) : (
  <LockIcon className="read-only-icon" title="Read Only" />
)}

// Add visual indicator for owned vs inherited permissions
{substage.isOwnedByUser && (
  <span className="badge-owner">Owner</span>
)}

{!substage.isOwnedByUser && editable && (
  <span className="badge-inherited">Inherited Access</span>
)}
```

**Key Features:**
- Backend provides `canEdit` flag based on direct or parent ownership
- Backend provides `isOwnedByUser` flag for UI differentiation
- Stage Owners can edit all substages under their stages
- Substage Owners can only edit substages they directly own

---

#### 14.2 Update Substage Hierarchy/Tree Components

**Files to Modify:**
1. `frontend/src/components/Project/AddStage/StageTreeNode.jsx`
2. `frontend/src/components/Project/ProjectHistory/TreeNode.jsx`

**Changes Required:**

```javascript
// Backend already filters substages hierarchically
// Just display what's returned

// Show lock icon for read-only substages in tree
const renderSubstageNode = (substage) => (
  <div className={`tree-node ${isReadOnly(substage) ? 'read-only' : ''}`}>
    {isReadOnly(substage) && <LockIcon className="lock-icon" />}
    <span>{substage.substageName}</span>
    {canEditSubstage(substage) && (
      <EditIcon onClick={() => handleEdit(substage)} />
    )}
  </div>
);
```

---

### Task 15: Create Assignment Management UI

#### 15.1 Create AssignmentManager Component

**File to Create:** `frontend/src/components/Project/AssignmentManager/AssignmentManager.jsx`

**Component Structure:**

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignmentManager = ({ projectNumber, isManager }) => {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stages, setStages] = useState([]);
  const [substages, setSubstages] = useState([]);
  
  // Only show for managers
  if (!isManager) {
    return (
      <div className="assignment-manager-restricted">
        <p>Only project managers can manage assignments.</p>
      </div>
    );
  }
  
  // Fetch assignments
  const fetchAssignments = async () => {
    const response = await axios.get(`/api/assignments/project/${projectNumber}`);
    setAssignments(response.data.data);
  };
  
  // Create assignment
  const createAssignment = async (employeeId, stageId, substageId) => {
    await axios.post('/api/assignments', {
      projectNumber,
      employeeId,
      stageId: stageId || null,
      substageId: substageId || null
    });
    fetchAssignments();
  };
  
  // Delete assignment
  const deleteAssignment = async (assignmentId) => {
    await axios.delete(`/api/assignments/${assignmentId}`);
    fetchAssignments();
  };
  
  return (
    <div className="assignment-manager">
      <h3>Manage Stage & Substage Assignments</h3>
      
      {/* Create Assignment Form */}
      <div className="create-assignment-form">
        <h4>Create New Assignment</h4>
        <select>
          <option>Select Employee</option>
          {employees.map(emp => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.employeeName}
            </option>
          ))}
        </select>
        
        <select>
          <option>Select Stage or Substage</option>
          <optgroup label="Stages">
            {stages.map(stage => (
              <option key={`stage-${stage.stageId}`} value={`stage-${stage.stageId}`}>
                {stage.stageName}
              </option>
            ))}
          </optgroup>
          <optgroup label="Substages">
            {substages.map(substage => (
              <option key={`substage-${substage.substageId}`} value={`substage-${substage.substageId}`}>
                {substage.substageName}
              </option>
            ))}
          </optgroup>
        </select>
        
        <button onClick={handleCreateAssignment}>Create Assignment</button>
      </div>
      
      {/* Assignment List */}
      <div className="assignment-list">
        <h4>Current Assignments</h4>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Stage/Substage</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.assignmentId}>
                <td>{assignment.employeeName}</td>
                <td>{assignment.stageId ? 'Stage' : 'Substage'}</td>
                <td>{assignment.stageName || assignment.substageName}</td>
                <td>{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => deleteAssignment(assignment.assignmentId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentManager;
```

---

#### 15.2 Integrate AssignmentManager into Project UI

**File to Modify:** `frontend/src/components/Project/MyProject/MyProject.jsx`

**Changes Required:**

```javascript
import AssignmentManager from '../AssignmentManager/AssignmentManager';
import { extractRoleInfo } from '../../../utils/rbacUtils';

// In MyProject component:
const [showAssignments, setShowAssignments] = useState(false);
const roleInfo = extractRoleInfo(user, projectData);

// Add tab or button to show assignment manager
<div className="project-tabs">
  <button onClick={() => setActiveTab('stages')}>Stages</button>
  <button onClick={() => setActiveTab('bom')}>BOM</button>
  {roleInfo.isManager && (
    <button onClick={() => setActiveTab('assignments')}>
      Assignments
    </button>
  )}
</div>

{activeTab === 'assignments' && (
  <AssignmentManager 
    projectNumber={projectNumber}
    isManager={roleInfo.isManager}
  />
)}
```

---

### Task 16: Implement Error Handling and User Feedback

#### 16.1 Add Authorization Error Handling to Frontend

**File to Modify:** `frontend/src/utils/axiosInterceptor.js`

**Changes Required:**

```javascript
// Add 403 error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      // Show user-friendly message
      showToast('error', 'Access Denied', error.response.data.message || 'You do not have permission to perform this action');
      
      // Optional: redirect or update UI state
      if (error.config.url.includes('/stages/') || error.config.url.includes('/substages/')) {
        // Refresh page to show updated permissions
        window.location.reload();
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Create Toast/Notification Component:**

```javascript
// frontend/src/components/common/Toast.jsx
export const showToast = (type, title, message) => {
  // Implementation depends on your notification library
  // Examples: react-toastify, notistack, custom toast
  
  toast.error({
    title,
    description: message,
    duration: 5000
  });
};
```

---

### Task 17: Add Audit Logging (Optional)

**File to Modify:** `backend/controllers/assignment.controller.js`

Add logging for all assignment changes:

```javascript
console.log(`[AUDIT] Assignment created: Employee ${employeeId} assigned to ${stageId ? 'Stage ' + stageId : 'Substage ' + substageId} by ${req.user[0].employeeId}`);

console.log(`[AUDIT] Assignment deleted: assignmentId ${assignmentId} by ${req.user[0].employeeId}`);
```

---

### Task 18: Run Migration Script

**Steps:**

1. Backup database
2. Run migration script:
```bash
cd backend
mysql -u username -p database_name < migrations/005_populate_stage_assignments.sql
```

3. Verify data:
```sql
SELECT COUNT(*) FROM stage_assignment;
SELECT * FROM stage_assignment LIMIT 10;
```

---

## Testing Checklist

### Backend RBAC (Task 11):
- [ ] Test Manager access (all stages visible, all editable)
- [ ] Test Stage Owner access (only owned stages visible)
- [ ] Test Substage Owner access (only owned substages visible)
- [ ] Test BOM access (Stage Owners can access, Substage Owners cannot)
- [ ] Test 403 responses for unauthorized edits

### Frontend RBAC (Tasks 13-16):
- [ ] Verify edit buttons hidden for read-only items
- [ ] Verify "Read Only" badges displayed correctly
- [ ] Verify substage hierarchy respects permissions
- [ ] Verify BOM edit controls disabled for Substage Owners
- [ ] Verify Assignment Manager only accessible to Managers
- [ ] Verify 403 errors show user-friendly messages

---

## File Summary

### Files Created:
- ✅ `frontend/src/utils/rbacUtils.js` - RBAC utility functions
- ⏳ `frontend/src/components/Project/AssignmentManager/AssignmentManager.jsx` - Assignment UI
- ⏳ `frontend/src/components/common/Toast.jsx` - Toast notifications

### Files to Modify:
- ⏳ `frontend/src/components/Project/AddStage/StageComponent.jsx`
- ⏳ `frontend/src/components/Project/MyStage/MyStage.jsx`
- ⏳ `frontend/src/components/Project/ActivityTable/ActivityTable.jsx`
- ⏳ `frontend/src/components/Project/ActivityTable/SubPartComponent.jsx`
- ⏳ `frontend/src/components/Project/EditStage/EditStageModal.jsx`
- ⏳ `frontend/src/components/Project/EditSubstage/EditSubstageModal.jsx`
- ⏳ `frontend/src/components/Project/MyProject/MyProject.jsx`
- ⏳ `frontend/src/utils/axiosInterceptor.js`

---

## Next Steps

1. **Complete Task 13:** Modify stage components to use rbacUtils
2. **Complete Task 14:** Modify substage components to use rbacUtils
3. **Complete Task 15:** Create and integrate AssignmentManager component
4. **Complete Task 16:** Add 403 error handling to axios interceptor
5. **Complete Task 17:** Add audit logging (optional)
6. **Complete Task 18:** Run migration script in production
7. **Complete Tasks 19-23:** Testing and validation

---

## Support

For questions or issues:
1. Check the design document: `.kiro/specs/project-rbac/design.md`
2. Review backend implementations in `backend/middleware/` and `backend/controllers/`
3. Test endpoints using the test files in `backend/test-*.js`
