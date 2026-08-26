# Project RBAC - Detailed Changes and Features Document

## Executive Summary

This document describes the complete changes being made to the Project Management section of the ERP system to implement **Role-Based Access Control (RBAC)** at the stage and substage level.

### What Problem Are We Solving?

**Current Problem:**
- When a manager assigns project access to an employee, they can see ALL stages and substages
- Employees can edit stages and substages that don't belong to them
- No way to restrict an employee to only their assigned work
- BOM (Bill of Materials) can be edited by anyone with project access

**Desired Outcome:**
- Managers see everything (no change for them)
- Stage owners see and edit their assigned stages and BOMs
- Stage owners can view (but not edit) child substages unless explicitly assigned
- Substage owners see and edit ONLY their assigned substages
- No one can access work they don't own

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Roles Explained](#user-roles-explained)
3. [Database Changes](#database-changes)
4. [Backend API Changes](#backend-api-changes)
5. [Frontend UI Changes](#frontend-ui-changes)
6. [New Features Added](#new-features-added)
7. [Existing Features Modified](#existing-features-modified)
8. [Security Enhancements](#security-enhancements)
9. [User Experience Changes](#user-experience-changes)
10. [Migration and Backward Compatibility](#migration-and-backward-compatibility)
11. [Implementation Timeline](#implementation-timeline)

---

## Feature Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT MANAGEMENT                        │
│                                                              │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐      │
│  │  MANAGER   │────▶│   STAGE    │────▶│  SUBSTAGE  │      │
│  │            │     │   OWNER    │     │   OWNER    │      │
│  │ Full Access│     │ Restricted │     │   Minimal  │      │
│  └────────────┘     └────────────┘     └────────────┘      │
│                                                              │
│  New: RBAC Layer (Role-Based Access Control)                │
│  ├─ Stage Assignment Tracking                               │
│  ├─ Permission Checking Middleware                          │
│  ├─ Data Filtering (API Level)                              │
│  └─ UI Component Visibility Control                         │
└─────────────────────────────────────────────────────────────┘
```

### Core Concept: Ownership-Based Permissions

The entire system is built around **ownership**:
- You can only edit what you **own**
- You can view related items for context (e.g., stage owner sees child substages)
- Managers own everything, regular employees own specific stages/substages

---

## User Roles Explained

### 1. Manager Role

**Who Gets This Role:**
- Project creator (person who created the project)
- Additional co-managers designated by system admin

**What They Can Do:**
```
✅ View ALL stages in the project
✅ Edit ALL stages in the project
✅ View ALL substages in the project
✅ Edit ALL substages in the project
✅ View ALL BOMs in the project
✅ Edit ALL BOMs in the project
✅ Assign stages to employees
✅ Assign substages to employees
✅ Remove assignments
✅ Reassign ownership
✅ Delete stages/substages
```

**What Changes for Them:**
- ❌ **Nothing!** Managers continue to work exactly as before
- ✨ **New Feature:** Assignment management interface to assign stages to team members

---

### 2. Stage Owner Role

**Who Gets This Role:**
- Employees assigned to a specific stage by the manager

**What They Can Do:**
```
✅ View their assigned stage
✅ Edit their assigned stage
✅ View the stage's BOM
✅ Edit the stage's BOM
✅ View ALL child substages under their stage (read-only)
✅ Edit child substages ONLY if explicitly assigned to them
✅ Update progress/status of their stage
✅ Add comments/notes to their stage
```

**What They CANNOT Do:**
```
❌ View other stages (not assigned to them)
❌ Edit other stages
❌ Edit child substages unless also assigned
❌ View or edit BOMs of other stages
❌ Delete stages
❌ Assign stages to others
```

**Example Scenario:**

Employee A is assigned **Stage 1 "Design Phase"**

```
Stage 1: Design Phase (Owner: Employee A)
│
├── ✅ Can Edit Stage 1
├── ✅ Can Edit Stage 1 BOM
│
└── Child Substages:
    ├── Substage 1.1 "Wireframes" (Owner: Employee B)
    │   ├── Can View ✅ (read-only)
    │   └── Cannot Edit ❌
    │
    ├── Substage 1.2 "Mockups" (Owner: Employee C)
    │   ├── Can View ✅ (read-only)
    │   └── Cannot Edit ❌
    │
    └── Substage 1.3 "Prototypes" (Owner: Employee A)
        ├── Can View ✅
        └── Can Edit ✅ (also assigned this substage)
```

**Why This Design?**
- Stage owners need to see child substages to coordinate work
- They shouldn't edit others' substages to prevent conflicts
- They control materials (BOM) for their stage

---

### 3. Substage Owner Role

**Who Gets This Role:**
- Employees assigned to a specific substage only (not the parent stage)

**What They Can Do:**
```
✅ View their assigned substage
✅ Edit their assigned substage
✅ Update progress/status of their substage
✅ Add comments/notes to their substage
✅ View nested child substages under their substage
✅ Edit nested child substages if also assigned
```

**What They CANNOT Do:**
```
❌ View the parent stage (or only read-only for context)*
❌ Edit the parent stage
❌ View sibling substages
❌ Edit sibling substages
❌ View or edit any BOM
❌ Delete substages
❌ Assign substages to others
```

*Note: Whether substage owners can see parent stage for context is configurable

**Example Scenario:**

Employee B is assigned **Substage 1.1 "Wireframes"** only

```
Stage 1: Design Phase (Owner: Employee A)
│
├── Cannot Edit Stage 1 ❌
├── Cannot Access BOM ❌
│
└── Substage 1.1: Wireframes (Owner: Employee B)
    ├── Can View ✅
    ├── Can Edit ✅
    │
    ├── Sibling Substage 1.2 → Cannot See ❌
    ├── Sibling Substage 1.3 → Cannot See ❌
    │
    └── Parent Stage 1 → Cannot Edit ❌ (may view for context)
```

**Why This Design?**
- Focused work: Employee only sees their specific task
- No distractions from unrelated work
- Cannot accidentally modify parent stage
- No access to materials (BOM) - that's stage owner's responsibility

---

### 4. Other Assignee Role

**Who Gets This Role:**
- Employees who have general project access but no specific stage/substage ownership
- Legacy users (before RBAC implementation)

**What They Can Do:**
```
❌ Nothing! Complete restriction.
```

**Use Case:**
- Observers who need to see project exists but shouldn't access any data
- Temporary team members during transition period
- To be assigned specific stages/substages later

---

## Database Changes

### New Table: `stage_assignment`

**Purpose:** Track which employee owns which stage or substage

**Schema:**

```sql
CREATE TABLE stage_assignment (
    assignmentId INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    projectNumber VARCHAR(50) NOT NULL,
    stageId INT UNSIGNED NULL,
    substageId INT UNSIGNED NULL,
    employeeId INT UNSIGNED NOT NULL,
    assignedBy INT UNSIGNED NOT NULL,
    assignedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_assignment_project 
        FOREIGN KEY (projectNumber) REFERENCES project(projectNumber) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_assignment_stage 
        FOREIGN KEY (stageId) REFERENCES stage(stageId) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_assignment_substage 
        FOREIGN KEY (substageId) REFERENCES substage(substageId) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_assignment_employee 
        FOREIGN KEY (employeeId) REFERENCES employee(employeeId) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_assignment_assignedby 
        FOREIGN KEY (assignedBy) REFERENCES employee(employeeId),
    
    -- Business Rule: Either stageId OR substageId must be set, not both
    CONSTRAINT chk_stage_or_substage 
        CHECK ((stageId IS NOT NULL AND substageId IS NULL) OR 
               (stageId IS NULL AND substageId IS NOT NULL)),
    
    -- Indexes for Performance
    INDEX idx_project (projectNumber),
    INDEX idx_employee (employeeId),
    INDEX idx_stage (stageId),
    INDEX idx_substage (substageId),
    
    -- Unique Constraint: Same employee can't be assigned same stage/substage twice
    UNIQUE KEY uk_employee_stage (employeeId, stageId),
    UNIQUE KEY uk_employee_substage (employeeId, substageId)
);
```

**Column Explanation:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `assignmentId` | INT | Unique ID for each assignment | 1, 2, 3... |
| `projectNumber` | VARCHAR | Which project | "PRJ-2024-001" |
| `stageId` | INT (nullable) | Assigned stage (if stage owner) | 15, NULL |
| `substageId` | INT (nullable) | Assigned substage (if substage owner) | NULL, 42 |
| `employeeId` | INT | Who is assigned | 290 |
| `assignedBy` | INT | Manager who made assignment | 1 |
| `assignedDate` | DATETIME | When assigned | 2024-08-18 10:30:00 |

**Example Data:**

```sql
-- Employee 290 owns Stage 5
INSERT INTO stage_assignment VALUES 
(1, 'PRJ-2024-001', 5, NULL, 290, 1, '2024-08-18 10:30:00');

-- Employee 291 owns Substage 42
INSERT INTO stage_assignment VALUES 
(2, 'PRJ-2024-001', NULL, 42, 291, 1, '2024-08-18 10:35:00');

-- Employee 290 ALSO owns Substage 43 (can own stage AND substages)
INSERT INTO stage_assignment VALUES 
(3, 'PRJ-2024-001', NULL, 43, 290, 1, '2024-08-18 10:40:00');
```

**Why This Table:**
- Flexible: Can assign at stage OR substage level
- Auditable: Tracks who assigned and when
- Performant: Indexed for fast lookups
- Safe: Foreign keys prevent orphaned assignments

---

## Backend API Changes

### New API Endpoints

#### 1. Create Stage Assignment

**Endpoint:** `POST /api/v1/stage-assignments`

**Purpose:** Manager assigns a stage or substage to an employee

**Request Body:**
```json
{
  "projectNumber": "PRJ-2024-001",
  "stageId": 5,           // Either stageId
  "substageId": null,     // OR substageId (not both)
  "employeeId": 290
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Stage assigned successfully",
  "data": {
    "assignmentId": 1,
    "projectNumber": "PRJ-2024-001",
    "stageId": 5,
    "substageId": null,
    "employeeId": 290,
    "assignedBy": 1,
    "assignedDate": "2024-08-18T10:30:00Z"
  }
}
```

**Authorization:** Only Managers can call this

---

#### 2. Get All Assignments for a Project

**Endpoint:** `GET /api/v1/stage-assignments/:projectNumber`

**Purpose:** View all stage/substage assignments in a project

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "assignmentId": 1,
      "stageName": "Design Phase",
      "substageName": null,
      "employeeName": "John Doe",
      "employeeId": 290,
      "assignedBy": "Manager Name",
      "assignedDate": "2024-08-18T10:30:00Z"
    },
    {
      "assignmentId": 2,
      "stageName": null,
      "substageName": "Wireframes",
      "employeeName": "Jane Smith",
      "employeeId": 291,
      "assignedBy": "Manager Name",
      "assignedDate": "2024-08-18T10:35:00Z"
    }
  ]
}
```

---

#### 3. Delete Assignment

**Endpoint:** `DELETE /api/v1/stage-assignments/:assignmentId`

**Purpose:** Remove a stage/substage assignment

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignment removed successfully"
}
```

**Authorization:** Only Managers can call this

---

### Modified API Endpoints

#### 1. Get Project Stages - NOW FILTERED

**Endpoint:** `GET /api/projects/:projectNumber/stages`

**Old Behavior:**
- Returns ALL stages for ANY user with project access

**New Behavior:**
- **Manager:** Returns ALL stages (unchanged)
- **Stage Owner:** Returns ONLY stages they own
- **Substage Owner:** Returns NOTHING (or parent stage for context if configured)
- **Other Assignee:** Returns NOTHING (403 error)

**Implementation:**
```javascript
// Old Code (No Filtering)
const stages = await db.query(
  'SELECT * FROM stage WHERE projectNumber = ?',
  [projectNumber]
);

// New Code (With RBAC Filtering)
let stages;
if (user.role === 'Manager') {
  // Manager sees everything
  stages = await db.query(
    'SELECT * FROM stage WHERE projectNumber = ?',
    [projectNumber]
  );
} else if (user.role === 'Stage_Owner') {
  // Stage Owner sees only their stages
  stages = await db.query(`
    SELECT s.* 
    FROM stage s
    INNER JOIN stage_assignment sa 
      ON s.stageId = sa.stageId
    WHERE s.projectNumber = ? 
      AND sa.employeeId = ?
  `, [projectNumber, user.employeeId]);
} else {
  // Substage Owner / Other - no stages
  stages = [];
}
```

---

#### 2. Get Substages - NOW FILTERED

**Endpoint:** `GET /api/stages/:stageId/substages`

**Old Behavior:**
- Returns ALL substages for ANY user

**New Behavior:**
- **Manager:** Returns ALL substages (unchanged)
- **Stage Owner:** Returns ALL substages under owned stage (with ownership flag)
- **Substage Owner:** Returns ONLY owned substages
- **Other Assignee:** Returns NOTHING (403 error)

**Response Format (New):**
```json
{
  "success": true,
  "data": [
    {
      "substageId": 42,
      "substageName": "Wireframes",
      "isOwned": false,        // ← NEW: User owns this substage?
      "isEditable": false,     // ← NEW: User can edit?
      "ownerName": "Jane Smith",
      "...": "other fields"
    },
    {
      "substageId": 43,
      "substageName": "Mockups",
      "isOwned": true,
      "isEditable": true,
      "ownerName": "John Doe (You)",
      "...": "other fields"
    }
  ]
}
```

---

#### 3. Update Stage - NOW PERMISSION CHECKED

**Endpoint:** `PUT /api/stages/:stageId`

**Old Behavior:**
- Any user can update any stage

**New Behavior:**
- Permission check BEFORE allowing update:
  - **Manager:** ✅ Can update any stage
  - **Stage Owner:** ✅ Can update ONLY owned stages
  - **Others:** ❌ 403 Forbidden

**Implementation:**
```javascript
// New Middleware: checkStageEditPermission
async function checkStageEditPermission(req, res, next) {
  const stageId = req.params.stageId;
  const userId = req.user.employeeId;
  
  // Check if user is Manager
  if (req.user.role === 'Manager') {
    return next(); // Allow
  }
  
  // Check if user owns this stage
  const assignment = await db.query(
    'SELECT * FROM stage_assignment WHERE stageId = ? AND employeeId = ?',
    [stageId, userId]
  );
  
  if (assignment.length > 0) {
    return next(); // Allow
  }
  
  // Not authorized
  return res.status(403).json({
    success: false,
    message: 'You do not have permission to edit this stage'
  });
}

// Apply middleware to route
router.put('/stages/:stageId', checkStageEditPermission, updateStage);
```

---

#### 4. Update Substage - NOW PERMISSION CHECKED

**Endpoint:** `PUT /api/substages/:substageId`

**New Permission Logic:**
- **Manager:** ✅ Can update any substage
- **Stage Owner:** ✅ Can update substages IF:
  - Substage is under their owned stage AND
  - They also have substage assignment
- **Substage Owner:** ✅ Can update ONLY owned substages
- **Others:** ❌ 403 Forbidden

**Complex Check:**
```javascript
async function checkSubstageEditPermission(req, res, next) {
  const substageId = req.params.substageId;
  const userId = req.user.employeeId;
  
  if (req.user.role === 'Manager') {
    return next();
  }
  
  // Check direct substage ownership
  const substageAssignment = await db.query(
    'SELECT * FROM stage_assignment WHERE substageId = ? AND employeeId = ?',
    [substageId, userId]
  );
  
  if (substageAssignment.length > 0) {
    return next(); // User owns this substage directly
  }
  
  // Check if user owns parent stage AND this substage
  const parentCheck = await db.query(`
    SELECT sa.* 
    FROM substage sub
    INNER JOIN stage s ON sub.stageId = s.stageId
    INNER JOIN stage_assignment sa ON s.stageId = sa.stageId
    WHERE sub.substageId = ? AND sa.employeeId = ?
  `, [substageId, userId]);
  
  if (parentCheck.length > 0) {
    // User owns parent stage but need to verify they can edit this substage
    // For now, we require explicit substage assignment
    return res.status(403).json({
      success: false,
      message: 'You can view this substage but cannot edit it. Contact project manager for access.'
    });
  }
  
  return res.status(403).json({
    success: false,
    message: 'You do not have permission to edit this substage'
  });
}
```

---

#### 5. Get/Update BOM - NOW RESTRICTED TO STAGE OWNERS

**Endpoints:** 
- `GET /api/bom/:stageId`
- `PUT /api/bom/:stageId`

**New Behavior:**
- **Manager:** ✅ Can access any BOM
- **Stage Owner:** ✅ Can access BOM ONLY for owned stages
- **Substage Owner:** ❌ 403 Forbidden (no BOM access)
- **Others:** ❌ 403 Forbidden

**Why:** BOMs are stage-level resources. Only stage owners manage materials.

---

### New Middleware Functions

#### 1. `roleDetectionMiddleware`

**Purpose:** Determine user's role for the current project

**Logic:**
```javascript
async function roleDetectionMiddleware(req, res, next) {
  const userId = req.user.employeeId;
  const projectNumber = req.params.projectNumber || req.body.projectNumber;
  
  // Check if user is project creator
  const project = await db.query(
    'SELECT projectCreatedBy FROM project WHERE projectNumber = ?',
    [projectNumber]
  );
  
  if (project[0].projectCreatedBy === userId) {
    req.user.projectRole = 'Manager';
    return next();
  }
  
  // Check stage/substage assignments
  const assignments = await db.query(
    'SELECT stageId, substageId FROM stage_assignment WHERE employeeId = ? AND projectNumber = ?',
    [userId, projectNumber]
  );
  
  if (assignments.length > 0) {
    const ownedStages = assignments.filter(a => a.stageId).map(a => a.stageId);
    const ownedSubstages = assignments.filter(a => a.substageId).map(a => a.substageId);
    
    req.user.projectRole = 'Assignee';
    req.user.ownedStages = ownedStages;
    req.user.ownedSubstages = ownedSubstages;
    return next();
  }
  
  // No role - deny access
  return res.status(403).json({
    success: false,
    message: 'You do not have access to this project'
  });
}
```

**Usage:**
```javascript
router.get('/projects/:projectNumber/stages', 
  authMiddleware,           // Check authentication
  projectAccessMiddleware,  // Check project access
  roleDetectionMiddleware,  // Determine RBAC role ← NEW
  getStages                 // Handle request
);
```

---

#### 2. `checkStageAccess`

**Purpose:** Verify user can access a specific stage

```javascript
async function checkStageAccess(req, res, next) {
  if (req.user.projectRole === 'Manager') {
    return next();
  }
  
  const stageId = req.params.stageId;
  if (req.user.ownedStages.includes(stageId)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'You do not have access to this stage'
  });
}
```

---

#### 3. `checkSubstageAccess`

**Purpose:** Verify user can access a specific substage

```javascript
async function checkSubstageAccess(req, res, next) {
  if (req.user.projectRole === 'Manager') {
    return next();
  }
  
  const substageId = req.params.substageId;
  
  // Check direct ownership
  if (req.user.ownedSubstages.includes(substageId)) {
    return next();
  }
  
  // Check if substage is under owned stage (for view-only)
  const substage = await db.query(
    'SELECT stageId FROM substage WHERE substageId = ?',
    [substageId]
  );
  
  if (req.user.ownedStages.includes(substage[0].stageId)) {
    req.viewOnly = true; // Mark as view-only
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'You do not have access to this substage'
  });
}
```

---

#### 4. `checkBOMAccess`

**Purpose:** Verify user can access BOM (stage owners only)

```javascript
async function checkBOMAccess(req, res, next) {
  if (req.user.projectRole === 'Manager') {
    return next();
  }
  
  const stageId = req.params.stageId;
  
  // BOM access requires stage ownership (not substage)
  if (req.user.ownedStages.includes(stageId)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'You do not have access to this BOM. Only stage owners can manage BOMs.'
  });
}
```

---

## Frontend UI Changes

### Modified Components

#### 1. Project Dashboard / Stage List

**Component:** `StageList.jsx` or `ProjectDashboard.jsx`

**Old Behavior:**
- Displays all stages to all users

**New Behavior:**
- Displays only stages returned by filtered API
- Shows ownership indicators
- Shows edit controls only for owned stages

**Visual Changes:**

```
OLD VIEW (All Users See Everything):
┌─────────────────────────────────────────┐
│ Project: Building Construction          │
├─────────────────────────────────────────┤
│ ✏️ Stage 1: Foundation    [Edit] [View] │
│ ✏️ Stage 2: Structure     [Edit] [View] │
│ ✏️ Stage 3: Interior      [Edit] [View] │
│ ✏️ Stage 4: Finishing     [Edit] [View] │
└─────────────────────────────────────────┘

NEW VIEW (Stage Owner sees only owned):
┌─────────────────────────────────────────┐
│ Project: Building Construction          │
├─────────────────────────────────────────┤
│ ✏️ Stage 2: Structure     [Edit] [View] │ ← Only their stage
│    👤 Assigned to: You                  │
└─────────────────────────────────────────┘

NEW VIEW (Manager sees all with ownership info):
┌─────────────────────────────────────────┐
│ Project: Building Construction          │
├─────────────────────────────────────────┤
│ ✏️ Stage 1: Foundation    [Edit] [View] │
│    👤 Assigned to: John Doe             │
│ ✏️ Stage 2: Structure     [Edit] [View] │
│    👤 Assigned to: Jane Smith           │
│ ✏️ Stage 3: Interior      [Edit] [View] │
│    👤 Assigned to: Bob Wilson           │
│ ✏️ Stage 4: Finishing     [Edit] [View] │
│    👤 Unassigned          [Assign]      │ ← New button
└─────────────────────────────────────────┘
```

**Code Changes:**

```javascript
// OLD CODE
function StageList({ projectNumber }) {
  const [stages, setStages] = useState([]);
  
  useEffect(() => {
    // Fetches all stages
    fetch(`/api/projects/${projectNumber}/stages`)
      .then(res => res.json())
      .then(data => setStages(data));
  }, [projectNumber]);
  
  return stages.map(stage => (
    <StageCard 
      stage={stage} 
      showEdit={true}  // Everyone can edit
    />
  ));
}

// NEW CODE
function StageList({ projectNumber, userRole, ownedStages }) {
  const [stages, setStages] = useState([]);
  
  useEffect(() => {
    // API now returns filtered stages based on role
    fetch(`/api/projects/${projectNumber}/stages`)
      .then(res => res.json())
      .then(data => setStages(data));
  }, [projectNumber]);
  
  return stages.map(stage => (
    <StageCard 
      stage={stage}
      showEdit={stage.isOwned || userRole === 'Manager'}  // Conditional edit
      showAssign={userRole === 'Manager'}  // Only managers assign
      isOwned={stage.isOwned}
    />
  ));
}
```

---

#### 2. Substage View (Under Stage)

**Component:** `SubstageList.jsx`

**Old Behavior:**
- All substages editable by all users

**New Behavior:**
- Stage owner sees all substages, but only owned ones are editable
- Substage owner sees only their substages
- Visual indicators for ownership

**Visual Changes:**

```
STAGE OWNER VIEW:
┌─────────────────────────────────────────────────────┐
│ Stage 2: Structure                                  │
│ 📦 BOM: [View/Edit]  ← Can edit                    │
├─────────────────────────────────────────────────────┤
│ Child Substages:                                    │
│                                                     │
│ 🔒 Substage 2.1: Foundation Work                   │
│    👤 Owner: John Doe                               │
│    📊 Progress: 60%                                 │
│    [View Details] (read-only)                       │
│                                                     │
│ 🔒 Substage 2.2: Column Erection                   │
│    👤 Owner: Bob Wilson                             │
│    📊 Progress: 30%                                 │
│    [View Details] (read-only)                       │
│                                                     │
│ ✏️ Substage 2.3: Beam Installation                 │
│    👤 Owner: You                                    │
│    📊 Progress: 45%                                 │
│    [Edit] [View Details]  ← Can edit               │
└─────────────────────────────────────────────────────┘

SUBSTAGE OWNER VIEW:
┌─────────────────────────────────────────────────────┐
│ Substage 2.1: Foundation Work                      │
│ 👤 Assigned to: You                                 │
├─────────────────────────────────────────────────────┤
│ Parent Stage: Structure (View Only)                │
│ 📊 Progress: 60%                                    │
│ [Edit] [Update Progress] [Add Notes]               │
│                                                     │
│ ⚠️ You cannot access the stage BOM                 │
│ ⚠️ Contact stage owner for materials               │
└─────────────────────────────────────────────────────┘
```

**Code Changes:**

```javascript
// NEW CODE
function SubstageCard({ substage, canEdit }) {
  return (
    <div className={`substage-card ${canEdit ? 'editable' : 'readonly'}`}>
      <div className="substage-header">
        {canEdit ? <EditIcon /> : <LockIcon />}
        <h4>{substage.substageName}</h4>
      </div>
      
      <div className="substage-info">
        <p>Owner: {substage.ownerName}</p>
        <ProgressBar value={substage.progress} />
      </div>
      
      <div className="substage-actions">
        <button onClick={() => viewDetails(substage.id)}>
          View Details
        </button>
        
        {canEdit && (
          <button onClick={() => editSubstage(substage.id)}>
            Edit
          </button>
        )}
      </div>
      
      {!canEdit && (
        <div className="readonly-notice">
          🔒 Read-only: Contact {substage.ownerName} for changes
        </div>
      )}
    </div>
  );
}
```

---

#### 3. BOM Management Interface

**Component:** `BOMEditor.jsx`

**Old Behavior:**
- Any user with project access can edit BOM

**New Behavior:**
- Only Manager and Stage Owner can access
- Substage owners see error message

**Visual Changes:**

```
STAGE OWNER VIEW:
┌─────────────────────────────────────────────────────┐
│ BOM - Stage 2: Structure                            │
│ 👤 Stage Owner: You                                 │
├─────────────────────────────────────────────────────┤
│ Materials List:                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Item          Qty    Unit    Cost   [Actions] │   │
│ ├───────────────────────────────────────────────┤   │
│ │ Steel Beams   20     pcs     $500   [Edit]    │   │
│ │ Concrete      50     m³      $200   [Edit]    │   │
│ │ Rebars        100    pcs     $50    [Edit]    │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ [+ Add Material] [Export BOM] [Print]              │
└─────────────────────────────────────────────────────┘

SUBSTAGE OWNER VIEW (Blocked):
┌─────────────────────────────────────────────────────┐
│ ⛔ Access Denied                                    │
├─────────────────────────────────────────────────────┤
│ You do not have permission to view this BOM.       │
│                                                     │
│ BOMs are managed at the stage level by the stage   │
│ owner. As a substage owner, you do not have        │
│ access to material management.                      │
│                                                     │
│ 💡 Contact the stage owner for material requests:  │
│    Stage 2: Structure                               │
│    Owner: Jane Smith (jane@company.com)             │
│                                                     │
│ [Back to My Substage]                               │
└─────────────────────────────────────────────────────┘
```

---

### New UI Components

#### 1. Assignment Manager (Manager Only)

**Component:** `AssignmentManager.jsx`

**Purpose:** Allow managers to assign stages/substages to employees

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────┐
│ Assignment Manager - Project: Building Construction         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Assign Stage or Substage:                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Select Stage:     [▼ Stage 2: Structure          ]   │   │
│ │ Or Select Substage: [▼ None                       ]   │   │
│ │ Assign to Employee: [▼ John Doe                   ]   │   │
│ │                                                       │   │
│ │ [Assign]                                              │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Current Assignments:                                        │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Stage/Substage      Employee       Assigned    [Action]│   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ Stage 1: Foundation John Doe       2024-08-10  [Remove]│   │
│ │ Stage 2: Structure  Jane Smith     2024-08-12  [Remove]│   │
│ │ ├─ Substage 2.1    John Doe       2024-08-13  [Remove]│   │
│ │ ├─ Substage 2.2    Bob Wilson     2024-08-13  [Remove]│   │
│ │ └─ Substage 2.3    Jane Smith     2024-08-14  [Remove]│   │
│ │ Stage 3: Interior   Bob Wilson     2024-08-15  [Remove]│   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [Export Assignments] [View Assignment History]             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✨ Dropdown to select stage or substage
- ✨ Employee picker with autocomplete
- ✨ Current assignments table
- ✨ Quick remove button for each assignment
- ✨ Assignment history tracking

---

#### 2. Ownership Badge

**Component:** `OwnershipBadge.jsx`

**Purpose:** Visual indicator of ownership on stages/substages

**Design:**

```javascript
function OwnershipBadge({ isOwned, ownerName }) {
  if (isOwned) {
    return (
      <div className="badge owned">
        👤 Your Stage
      </div>
    );
  }
  
  return (
    <div className="badge readonly">
      🔒 {ownerName}
    </div>
  );
}
```

**Styling:**
```css
.badge.owned {
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.badge.readonly {
  background: #9E9E9E;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}
```

---

#### 3. Permission Denied Page

**Component:** `PermissionDenied.jsx`

**Purpose:** Friendly error page when access is denied

**Design:**

```
┌─────────────────────────────────────────────────────┐
│            ⛔ Access Restricted                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ You don't have permission to view this content.    │
│                                                     │
│ This stage/substage is assigned to another         │
│ team member. If you need access:                   │
│                                                     │
│ 1. Contact the project manager                     │
│ 2. Request assignment to this stage                │
│ 3. Or focus on your assigned tasks                 │
│                                                     │
│ Your Current Assignments:                          │
│ • Stage 2: Structure                               │
│ • Substage 3.1: Interior Design                    │
│                                                     │
│ [View My Assignments] [Contact Manager]            │
└─────────────────────────────────────────────────────┘
```

---

## New Features Added

### 1. ✨ Stage Assignment Feature

**What:** Managers can assign specific stages to employees

**How:**
- New "Assign" button on each stage
- Assignment modal with employee picker
- Tracks who assigned and when

**Benefits:**
- Clear ownership of stages
- Better team coordination
- Audit trail of assignments

---

### 2. ✨ Substage Assignment Feature

**What:** Managers can assign specific substages to employees

**How:**
- Hierarchical assignment view
- Can assign substage without assigning parent stage
- Employee sees only their substage

**Benefits:**
- Granular task delegation
- Focused work for employees
- Prevents scope creep

---

### 3. ✨ View-Only Child Substages for Stage Owners

**What:** Stage owners can see but not edit child substages

**How:**
- Substages displayed with lock icon
- Edit buttons hidden
- Progress visible for coordination

**Benefits:**
- Stage coordination
- Progress tracking
- No accidental edits

---

### 4. ✨ BOM Access Control

**What:** Only stage owners can manage BOMs

**How:**
- BOM access tied to stage ownership
- Substage owners get access denied
- Clear error messages

**Benefits:**
- Material management clarity
- Prevents unauthorized BOM changes
- Stage owner controls resources

---

### 5. ✨ Assignment History and Audit Trail

**What:** Track all assignment changes

**How:**
- `assignedBy` and `assignedDate` in database
- Assignment history view for managers
- Export functionality

**Benefits:**
- Accountability
- Compliance tracking
- Historical record

---

### 6. ✨ Role-Based Navigation

**What:** Navigation menu adapts to user role

**How:**
- Stage owners see only their stages in sidebar
- Substage owners see only their substages
- Managers see full project tree

**Benefits:**
- Simplified navigation
- Reduced clutter
- Faster access to relevant work

---

### 7. ✨ Permission Indicators

**What:** Visual cues for edit permissions

**How:**
- Lock icons for read-only items
- Edit icons for owned items
- Colored badges for ownership

**Benefits:**
- Clear visual feedback
- Reduced confusion
- Better UX

---

## Existing Features Modified

### 1. 🔧 Project Dashboard

**Changes:**
- Now filters stages based on user role
- Shows ownership badges
- Hides edit controls for non-owned stages

**Impact:**
- Low (managers see no change)
- Medium (employees see filtered view)

---

### 2. 🔧 Stage Detail Page

**Changes:**
- Edit button conditional on ownership
- Shows owner information
- Displays child substages with permissions

**Impact:**
- Low (mostly additive)

---

### 3. 🔧 Substage Detail Page

**Changes:**
- Edit button conditional on ownership
- Shows parent stage context
- Hides sibling substages

**Impact:**
- Medium (substage owners see less)

---

### 4. 🔧 BOM Management

**Changes:**
- Access restricted to stage owners
- Clear error for substage owners
- Owner contact information shown

**Impact:**
- High (substage owners lose BOM access)
- Mitigation: Clear communication about who to contact

---

### 5. 🔧 Progress Tracking

**Changes:**
- Users can only update progress for owned items
- View-only progress for non-owned items
- Manager can update anything

**Impact:**
- Low (expected behavior)

---

### 6. 🔧 Activity Feed/History

**Changes:**
- Filtered based on accessible stages/substages
- Assignment events added to activity log

**Impact:**
- Low (privacy improvement)

---

## Security Enhancements

### 1. 🔐 Backend Permission Checks

**What:** Every API endpoint validates permissions

**Implementation:**
- Middleware checks before allowing access
- Database queries filtered by ownership
- 403 errors for unauthorized access

**Example:**
```javascript
// BEFORE: No check
router.put('/stages/:stageId', updateStage);

// AFTER: With permission check
router.put('/stages/:stageId', 
  authMiddleware,                // Authentication
  roleDetectionMiddleware,       // Determine role
  checkStageEditPermission,      // Check ownership ← NEW
  updateStage                    // Execute if allowed
);
```

---

### 2. 🔐 Data Filtering at Database Level

**What:** SQL queries filter data based on user

**Implementation:**
- JOIN with stage_assignment table
- WHERE clauses with employeeId
- No sensitive data leaks

**Example:**
```sql
-- BEFORE: Returns everything
SELECT * FROM stage WHERE projectNumber = ?

-- AFTER: Returns only owned stages
SELECT s.* 
FROM stage s
INNER JOIN stage_assignment sa ON s.stageId = sa.stageId
WHERE s.projectNumber = ? AND sa.employeeId = ?
```

---

### 3. 🔐 Frontend Component Guards

**What:** UI components check permissions before rendering

**Implementation:**
- Conditional rendering based on role
- Hide sensitive buttons/links
- Display permission denied messages

**Example:**
```javascript
{canEdit && (
  <button onClick={handleEdit}>Edit</button>
)}

{!canEdit && (
  <div className="readonly-notice">
    🔒 This stage is managed by {ownerName}
  </div>
)}
```

---

### 4. 🔐 API Response Sanitization

**What:** Backend removes sensitive data from responses

**Implementation:**
- Only return fields user is allowed to see
- Add `isOwned` and `isEditable` flags
- Remove other users' private data

**Example:**
```javascript
// BEFORE: Return raw database record
return substage;

// AFTER: Add permission flags
return {
  ...substage,
  isOwned: substage.employeeId === currentUser.id,
  isEditable: checkEditPermission(substage, currentUser),
  // Remove sensitive fields for non-owners
  ...(substage.employeeId !== currentUser.id && {
    internalNotes: undefined,
    costDetails: undefined
  })
};
```

---

## User Experience Changes

### For Managers (No Disruption)

**✅ What Stays the Same:**
- Can see all stages and substages
- Can edit everything
- Full project visibility
- No workflow changes

**✨ What's New:**
- Assignment management interface
- Ownership badges on all items
- Assignment history tracking
- Can delegate more effectively

**😊 User Experience:**
- Smooth transition
- Additional controls feel natural
- More powerful delegation tools

---

### For Stage Owners

**✅ What They Can Do:**
- Edit their assigned stages
- Manage stage BOMs
- View all child substages
- Edit child substages if also assigned

**⚠️ What Changes:**
- Only see their assigned stages
- Can't edit other employees' substages
- More focused dashboard

**😊 User Experience:**
- Cleaner, focused interface
- Less confusion about what to work on
- Clear ownership and responsibility

---

### For Substage Owners

**✅ What They Can Do:**
- Edit their assigned substages
- Update progress
- View parent stage (for context)

**⚠️ What They Cannot Do:**
- Edit parent stage
- Access BOM
- See sibling substages

**😊 User Experience:**
- Very focused task view
- No distractions
- Clear scope of work
- May need to contact stage owner for materials

---

## Migration and Backward Compatibility

### Migration Strategy

**Phase 1: Database Setup**
1. Create `stage_assignment` table
2. Add indexes for performance
3. Test foreign key constraints

**Phase 2: Data Migration**
1. Auto-assign all stages to project creators (managers)
2. For existing team members:
   - If they had project access → assign all stages
   - Or manually assign by manager
3. Verify no orphaned data

**Phase 3: Backend Deployment**
1. Deploy new middleware
2. Enable permission checks
3. Monitor for 403 errors
4. Provide clear error messages

**Phase 4: Frontend Deployment**
1. Deploy UI changes
2. Show ownership badges
3. Hide unauthorized controls
4. Release assignment manager

**Phase 5: Training and Communication**
1. Manager training on assignment feature
2. Employee communication about changes
3. Help documentation
4. Support for questions

---

### Backward Compatibility

**Existing Projects:**
- All stages assigned to project creator initially
- No disruption to current work
- Gradual adoption of assignments

**Existing APIs:**
- New endpoints added (no breaking changes)
- Existing endpoints enhanced with filtering
- Response format extended (backward compatible)

**Data Integrity:**
- Foreign keys prevent orphaned assignments
- Cascade deletes maintain consistency
- No data loss during migration

---

## Implementation Timeline

### Week 1-2: Database and Backend

**Tasks:**
- [ ] Create `stage_assignment` table
- [ ] Implement roleDetectionMiddleware
- [ ] Add permission check middleware
- [ ] Update stage API with filtering
- [ ] Update substage API with filtering
- [ ] Update BOM API with restrictions
- [ ] Create assignment management endpoints
- [ ] Write unit tests

**Deliverables:**
- ✅ Database schema created
- ✅ Backend APIs updated
- ✅ Tests passing

---

### Week 3-4: Frontend UI

**Tasks:**
- [ ] Create AssignmentManager component
- [ ] Add ownership badges
- [ ] Implement conditional rendering
- [ ] Update StageList component
- [ ] Update SubstageList component
- [ ] Update BOM interface
- [ ] Create PermissionDenied page
- [ ] Update navigation based on role

**Deliverables:**
- ✅ UI components completed
- ✅ Visual indicators working
- ✅ Permission checks in place

---

### Week 5: Testing and Migration

**Tasks:**
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Data migration script
- [ ] Run migration on staging
- [ ] Performance testing
- [ ] Fix bugs

**Deliverables:**
- ✅ Migration script ready
- ✅ All tests passing
- ✅ Performance validated

---

### Week 6: Deployment and Training

**Tasks:**
- [ ] Deploy to production
- [ ] Run data migration
- [ ] Monitor for errors
- [ ] Manager training session
- [ ] Employee communication
- [ ] Create help docs
- [ ] Gather feedback

**Deliverables:**
- ✅ Feature live in production
- ✅ Training completed
- ✅ Documentation published

---

## Conclusion

This RBAC implementation adds powerful access control to the Project Management section while maintaining a smooth user experience. The key benefits are:

1. **✅ Security:** Prevents unauthorized data access
2. **✅ Focus:** Employees see only their work
3. **✅ Coordination:** Stage owners monitor child progress
4. **✅ Flexibility:** Granular stage/substage assignments
5. **✅ Audit:** Track ownership and changes
6. **✅ Compatibility:** No disruption to existing workflows

The implementation is careful, gradual, and reversible if needed. Managers retain full control while employees get focused, secure access to their assigned work.

---

## Appendix: Quick Reference

### Permission Matrix

| Action | Manager | Stage Owner | Substage Owner | Other |
|--------|---------|-------------|----------------|-------|
| View all stages | ✅ | ❌ | ❌ | ❌ |
| Edit owned stage | ✅ | ✅ | ❌ | ❌ |
| View child substages | ✅ | ✅ | ❌ | ❌ |
| Edit child substages | ✅ | ✅* | ✅** | ❌ |
| View/Edit BOM | ✅ | ✅ | ❌ | ❌ |
| Assign stages | ✅ | ❌ | ❌ | ❌ |

*Only if also assigned that substage  
**Only their own substage

### API Endpoints Summary

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `POST /api/v1/stage-assignments` | Create assignment | Manager only |
| `GET /api/v1/stage-assignments/:projectNumber` | List assignments | Manager only |
| `DELETE /api/v1/stage-assignments/:id` | Remove assignment | Manager only |
| `GET /api/projects/:projectNumber/stages` | Get stages (filtered) | Authenticated |
| `GET /api/stages/:stageId/substages` | Get substages (filtered) | Authenticated |
| `PUT /api/stages/:stageId` | Update stage | Owner or Manager |
| `PUT /api/substages/:substageId` | Update substage | Owner or Manager |
| `GET /api/bom/:stageId` | Get BOM | Stage Owner or Manager |
| `PUT /api/bom/:stageId` | Update BOM | Stage Owner or Manager |

---

**Document Version:** 1.0  
**Last Updated:** 2024-08-18  
**Author:** Development Team  
**Status:** Ready for Review
