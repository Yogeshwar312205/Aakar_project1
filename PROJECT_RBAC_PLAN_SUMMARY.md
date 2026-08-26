# Project RBAC Plan Summary

## Overview
Implementation plan for role-based access control (RBAC) in the Project Management section, defining granular permissions for stages, substages, and BOMs based on ownership.

## Role Hierarchy

```
MANAGER
│── Full Project Access
│   ├── View + Edit ALL Stages
│   ├── View + Edit ALL Substages  
│   └── View + Edit ALL BOMs

STAGE OWNER
│── Own Stage → View + Edit
│── Stage BOM → View + Edit
│── Child Substages → View Only
│   └── Edit ONLY if also assigned as Substage Owner

SUBSTAGE OWNER
│── Own Substage → View + Edit
│── Parent Stage → View Only* (optional)
│── Sibling Substages → ❌ No Access
│── BOMs → ❌ No Access

OTHER ASSIGNEE
└── ❌ No Access to anything
```

*Configuration decision: Whether Substage Owners can see parent stage for context

## Access Control Matrix

| User Role | Stage (Owned) | Stage (Others) | Child Substages (Owned) | Child Substages (Others) | Stage BOM (Owned) | Stage BOM (Others) |
|-----------|---------------|----------------|-------------------------|--------------------------|-------------------|--------------------|
| **Manager** | ✅ View + Edit | ✅ View + Edit | ✅ View + Edit | ✅ View + Edit | ✅ View + Edit | ✅ View + Edit |
| **Stage Owner** | ✅ View + Edit | ❌ No Access | ✅ View + Edit | ⚠️ View Only | ✅ View + Edit | ❌ No Access |
| **Substage Owner** | ⚠️ View Only* | ❌ No Access | ✅ View + Edit | ❌ No Access | ❌ No Access | ❌ No Access |
| **Other Assignee** | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access |

## Key Rules

### 1. Stage Ownership Grants:
- ✅ Edit the stage
- ✅ Edit the stage's BOM
- ✅ View all child substages (read-only)
- ✅ Edit child substages ONLY if explicitly assigned

### 2. Substage Ownership Grants:
- ✅ Edit the owned substage
- ⚠️ View parent stage (optional configuration)
- ❌ Cannot edit parent stage
- ❌ Cannot see sibling substages
- ❌ Cannot access any BOM

### 3. Important Relationships:

```
Stage Owner (Employee A)
│
├── Stage 1 → ✅ Edit
│   ├── BOM → ✅ Edit
│   └── Child Substages
│       ├── Substage A (Owner: Employee B)
│       │   ├── View ✅
│       │   └── Edit ❌ (not assigned to A)
│       │
│       ├── Substage B (Owner: Employee C)
│       │   ├── View ✅
│       │   └── Edit ❌ (not assigned to A)
│       │
│       └── Substage C (Owner: Employee A)
│           ├── View ✅
│           └── Edit ✅ (assigned to A)
```

```
Substage Owner (Employee B)
│
└── Substage A → ✅ Edit
    ├── Parent Stage → ⚠️ View Only (optional)
    ├── Sibling Substages → ❌ No Access
    └── Stage BOM → ❌ No Access
```

## Implementation Components

### 1. Database Changes
- **New Table**: `stage_assignment`
  - `assignmentId` (PK)
  - `projectNumber` (FK)
  - `stageId` (FK, nullable)
  - `substageId` (FK, nullable)
  - `employeeId` (FK)
  - `assignedBy` (FK to employee)
  - `assignedDate` (timestamp)
  - **Constraint**: Either `stageId` OR `substageId` must be set, not both

### 2. Backend Changes

#### API Filtering:
- **GET /stages**: Filter by role and ownership
  - Manager: Return all
  - Stage Owner: Return owned stages only
  - Substage Owner: Return nothing (or parent for context)

- **GET /substages**: Filter by role and ownership
  - Manager: Return all
  - Stage Owner: Return all children of owned stages
  - Substage Owner: Return owned substages only

- **GET /bom**: Filter by role and ownership
  - Manager: Return all
  - Stage Owner: Return BOM for owned stages only
  - Substage Owner: Return nothing (403 error)

#### Authorization Middleware:
- `checkStageEditPermission`: Verify stage ownership
- `checkSubstageEditPermission`: Verify substage ownership or parent stage ownership
- `checkBOMEditPermission`: Verify stage ownership (BOMs are stage-level only)

#### New Endpoints:
- `POST /api/stage-assignments`: Create assignment (Manager only)
- `GET /api/stage-assignments/:projectNumber`: List assignments
- `DELETE /api/stage-assignments/:assignmentId`: Remove assignment (Manager only)

### 3. Frontend Changes

#### Display Logic:
- Show only stages/substages returned by filtered APIs
- Display edit buttons only for owned resources
- Show read-only indicators for view-only items
- Hide unauthorized resources completely

#### Visual Indicators:
- 🔒 Lock icon: View-only child substages
- ✏️ Edit icon: Owned and editable
- 👁️ View icon: Read-only context (optional parent stage)

### 4. Migration Strategy
- Automatically assign all stages to existing project creators (Managers)
- Create Stage_Assignment records for existing team members
- Preserve existing access patterns during transition

## Example Scenarios

### Scenario 1: Stage Owner with Mixed Child Substages

**Employee A owns Stage 1:**
- Can edit Stage 1 ✅
- Can edit Stage 1 BOM ✅
- Can view Substage A (owned by B) ⚠️ Read-only
- Can view Substage B (owned by C) ⚠️ Read-only
- Can edit Substage C (also assigned to A) ✅

### Scenario 2: Substage Owner Isolation

**Employee B owns Substage A only:**
- Can edit Substage A ✅
- Can view parent Stage 1 ⚠️ Read-only (optional)
- Cannot see Substage B ❌
- Cannot see Substage C ❌
- Cannot edit Stage 1 BOM ❌

### Scenario 3: Manager Full Access

**Manager (project creator):**
- Can view and edit everything ✅
- Can assign stages to employees ✅
- Can reassign ownership ✅
- Can edit all BOMs ✅

## Benefits

1. ✅ **Security**: Prevents unauthorized data access and edits
2. ✅ **Focus**: Employees see only their assigned work
3. ✅ **Coordination**: Stage owners can monitor child progress
4. ✅ **Flexibility**: Granular assignment at stage or substage level
5. ✅ **Audit Trail**: Track who owns what and when assigned
6. ✅ **BOM Protection**: Only stage owners can manage materials

## Next Steps

1. ✅ **Requirements Document Created** (`.kiro/specs/project-rbac/requirements.md`)
2. ⏭️ **Next: Create Design Document** (database schema, API design, middleware)
3. ⏭️ **Then: Create Task List** (implementation steps)
4. ⏭️ **Implementation**: Follow task list to build features
5. ⏭️ **Testing**: Verify each role's permissions
6. ⏭️ **Migration**: Transition existing projects

---

**Status**: Requirements phase complete ✅  
**Location**: `.kiro/specs/project-rbac/`  
**Ready for**: Design phase
