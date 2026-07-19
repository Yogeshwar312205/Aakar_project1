# Component Structure: Edit Feature

## 📂 File Organization

```
frontend/src/
├── components/
│   ├── Project/
│   │   ├── MyProject/
│   │   │   └── MyProject.jsx ................................. ✏️ UPDATED
│   │   ├── MyStage/
│   │   │   └── MyStage.jsx ................................... ✏️ UPDATED
│   │   ├── EditStage/
│   │   │   └── EditStageModal.jsx ............................ ⭐ NEW
│   │   └── EditSubstage/
│   │       └── EditSubstageModal.jsx ......................... ⭐ NEW
│   └── common/
│       └── SubstageTreeNode/
│           ├── SubstageTreeNode.jsx .......................... ✏️ UPDATED
│           └── SubstageTreeNode.css .......................... ✏️ UPDATED
└── features/
    ├── stageSlice.js ......................................... ✅ EXISTING (used)
    ├── subStageSlice.js ...................................... ✅ EXISTING (used)
    └── employeeSlice.js ...................................... ✅ EXISTING (used)
```

---

## 🏗️ Component Hierarchy

### Stage Edit Flow
```
App.jsx
  └── Layout.jsx
       └── MyProject.jsx ................................. [Edit Button Added]
            ├── Stage Cards (map)
            │    └── [Edit] Button ...................... Click to open modal
            │
            └── EditStageModal.jsx ....................... [NEW Component]
                 ├── Dialog (MUI)
                 ├── Form Fields
                 │    ├── TextField (Stage Name)
                 │    ├── Autocomplete (Owner)
                 │    ├── DatePicker (Start/End)
                 │    ├── TextField (Machine)
                 │    ├── TextField (Duration)
                 │    └── TextField (Update Reason)
                 └── Action Buttons
                      ├── Cancel
                      └── Save ........................... Dispatch updateStage
```

### Substage Edit Flow
```
App.jsx
  └── Layout.jsx
       └── MyProject.jsx
            └── (Navigate to Stage) ...................... Click stage card
                 └── MyStage.jsx ......................... [Edit Handler Added]
                      ├── Stage Header
                      ├── Substage Tree
                      │    └── SubstageTreeNode.jsx ...... [Edit Button Added]
                      │         ├── Node Header
                      │         ├── Node Info
                      │         ├── Actions
                      │         │    ├── [Edit] ......... Click to open modal
                      │         │    ├── [Add]
                      │         │    └── [Delete]
                      │         └── Children (recursive)
                      │
                      └── EditSubstageModal.jsx ........... [NEW Component]
                           ├── Dialog (MUI)
                           ├── Form Fields
                           │    ├── TextField (Substage Name)
                           │    ├── Autocomplete (Owner)
                           │    ├── DatePicker (Start/End)
                           │    ├── TextField (Machine)
                           │    ├── TextField (Duration)
                           │    └── TextField (Update Reason)
                           └── Action Buttons
                                ├── Cancel
                                └── Save ................ Dispatch updateSubStage
```

---

## 🔄 Data Flow Architecture

### Redux Store Structure
```
store
├── auth
│   └── user
│       └── employeeAccess ...................... Permission checks
├── stages
│   ├── stage ................................ Single stage data
│   ├── activeStages ......................... List of stages
│   └── historyStages ........................ Stage history
├── substages
│   ├── substage ............................. Single substage
│   ├── activeSubStages ...................... List of substages
│   └── historySubStages ..................... Substage history
├── employee
│   └── employees ............................ For owner dropdown
└── projects
    └── project .............................. Project data
```

### Stage Edit Data Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
                    [Click Edit Button]
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT STATE                             │
├─────────────────────────────────────────────────────────────────┤
│  • selectedStage = stage                                         │
│  • editStageModalOpen = true                                     │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MODAL OPENS (EditStageModal)                   │
├─────────────────────────────────────────────────────────────────┤
│  • Load stage data into form                                     │
│  • Fetch employees for dropdown                                  │
│  • Display current values                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
                   [User Edits & Clicks Save]
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FORM VALIDATION                             │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Stage name not empty                                          │
│  ✓ Owner selected                                                │
│  ✓ Update reason provided                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REDUX ACTION                                │
├─────────────────────────────────────────────────────────────────┤
│  dispatch(updateStage({                                          │
│    stageId, projectNumber, stageName, startDate, endDate,        │
│    owner, machine, duration, progress, updateReason, timestamp   │
│  }))                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API CALL                                 │
├─────────────────────────────────────────────────────────────────┤
│  PUT /api/stages/:id                                             │
│  Body: { stage data + updateReason + timestamp }                │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND PROCESSING                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Validate request & owner                                     │
│  2. Check for actual changes                                     │
│  3. Insert history record (historyOf = stageId)                 │
│  4. Update stage with new data                                   │
│  5. Return success response                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUCCESS HANDLING                             │
├─────────────────────────────────────────────────────────────────┤
│  • Display success toast ✅                                      │
│  • Close modal                                                   │
│  • Refresh Redux store:                                          │
│    - fetchActiveStagesByProjectNumber()                          │
│    - fetchSingleStageById()                                      │
│    - fetchProjectById()                                          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UI UPDATE                                   │
├─────────────────────────────────────────────────────────────────┤
│  • Stage card shows updated data                                 │
│  • All related components re-render                              │
│  • User sees changes immediately                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Substage Edit Data Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
                   [Click Edit Icon (✏️)]
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT STATE                             │
├─────────────────────────────────────────────────────────────────┤
│  • selectedSubstage = substage                                   │
│  • editSubstageModalOpen = true                                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                MODAL OPENS (EditSubstageModal)                   │
├─────────────────────────────────────────────────────────────────┤
│  • Load substage data into form                                  │
│  • Fetch employees for dropdown                                  │
│  • Display current values                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
                   [User Edits & Clicks Save]
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FORM VALIDATION                             │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Substage name not empty                                       │
│  ✓ Owner selected                                                │
│  ✓ Update reason provided                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REDUX ACTION                                │
├─────────────────────────────────────────────────────────────────┤
│  dispatch(updateSubStage({                                       │
│    substageId, stageId, projectNumber, parentSubstageId,         │
│    substagename, startDate, endDate, owner, machine,             │
│    duration, progress, updateReason, timestamp                   │
│  }))                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API CALL                                 │
├─────────────────────────────────────────────────────────────────┤
│  PUT /api/subStages/:id                                          │
│  Body: { substage data + updateReason + timestamp }             │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND PROCESSING                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Validate request & owner                                     │
│  2. Check for actual changes                                     │
│  3. Insert history record (historyOf = substageId)              │
│  4. Update substage with new data                                │
│  5. Recalculate stage progress                                   │
│  6. Recalculate project progress                                 │
│  7. Return success response                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUCCESS HANDLING                             │
├─────────────────────────────────────────────────────────────────┤
│  • Display success toast ✅                                      │
│  • Close modal                                                   │
│  • Refresh Redux store:                                          │
│    - getActiveSubStagesByStageId()                               │
│    - fetchSingleStageById()                                      │
│    - fetchProjectById()                                          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UI UPDATE                                   │
├─────────────────────────────────────────────────────────────────┤
│  • Substage row shows updated data                               │
│  • Stage progress updates if affected                            │
│  • Project progress updates if affected                          │
│  • User sees changes immediately                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Component Layout

### MyProject Page (Stage Edit)
```
┌────────────────────────────────────────────────────────────────────┐
│  Dashboard / My Project                            [Gantt] [Edit]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🔵 #P001  [Completed]                               45%       │ │
│  │ ABC Corp — Die Assembly                         ━━━━━━━━      │ │
│  │ Die #: 123 • Type: New • 01-01-2024 → 31-01-2024             │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [Stages (3)] [History (12)]                                       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  1  Assembly                            45%   [Edit] │ ← Edit  │
│  │     Owner: John • Machine: M1                        │   Button│
│  │     Planned: 01-01 → 15-01                           │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  2  Testing                             30%   [Edit] │         │
│  │     Owner: Jane • Machine: M2                        │         │
│  │     Planned: 16-01 → 31-01                           │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### MyStage Page (Substage Edit)
```
┌────────────────────────────────────────────────────────────────────┐
│  Dashboard / My Project / My Stage             [Gantt] [Edit]      │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Assembly                                           45%         │ │
│  │ Owner: John • Machine: M1 • Duration: 30 Days      ━━━━━━━━   │ │
│  │ Planned: 01-01-2024 → 31-01-2024 • Created: Admin            │ │
│  │                                          2/5 substages done   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Substages [5 total]                                               │
│                                                                     │
│  ☑ ▼ Preparation              100%  ✓ Done   [✏️] [+] [🗑️]       │
│       Owner: John • Machine: M1 • Duration: 5 days   ↑ Edit Icon  │
│       Planned: 01-01 → 05-01                                       │
│       Executed: 01-01 → 04-01                                      │
│                                                                     │
│    ☑ ▼ Material Check         100%  ✓ Done   [✏️] [+] [🗑️]       │
│         Owner: Mike • Machine: M1 • Duration: 2 days              │
│                                                                     │
│  ☐ ▶ Welding                   45%  Pending  [✏️] [+] [🗑️]       │
│       Owner: Sarah • Machine: M2 • Duration: 10 days              │
│       Planned: 06-01 → 15-01                                       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Edit Modal Layout
```
╔════════════════════════════════════════════════════════════════╗
║ Edit Stage: Assembly                                      [×]  ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Stage Name*                                                    ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Assembly                                                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                 ║
║  Owner*                                                         ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ John Doe (EMP001)                                      ▼ │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                 ║
║  Start Date              End Date                               ║
║  ┌─────────────────────┐ ┌─────────────────────┐              ║
║  │ 01-01-2024  📅      │ │ 31-01-2024  📅      │              ║
║  └─────────────────────┘ └─────────────────────┘              ║
║                                                                 ║
║  Machine                 Duration (days)                        ║
║  ┌─────────────────────┐ ┌─────────────────────┐              ║
║  │ Machine 1           │ │ 30                  │              ║
║  └─────────────────────┘ └─────────────────────┘              ║
║                                                                 ║
║  Update Reason*                                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Extended timeline due to material delay                   │ ║
║  │                                                            │ ║
║  │                                                            │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                 ║
╠════════════════════════════════════════════════════════════════╣
║                                        [Cancel] [Save Changes]  ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🔗 Integration Points

### Component Dependencies
```
EditStageModal
├── Dependencies
│   ├── React (hooks: useState, useEffect)
│   ├── Redux (useDispatch, useSelector)
│   ├── Material-UI (Dialog, TextField, Autocomplete, DatePicker)
│   ├── dayjs (date formatting)
│   └── react-toastify (notifications)
│
├── Redux Actions
│   ├── getAllEmployees() ................... Fetch employee list
│   ├── updateStage() ....................... Update stage
│   ├── fetchActiveStagesByProjectNumber() .. Refresh stages
│   ├── fetchSingleStageById() .............. Refresh single stage
│   └── fetchProjectById() .................. Refresh project
│
└── Props
    ├── open (boolean) ...................... Modal visibility
    ├── onClose (function) .................. Close handler
    ├── stage (object) ...................... Stage data
    └── projectNumber (string) .............. Project identifier
```

```
EditSubstageModal
├── Dependencies
│   ├── React (hooks: useState, useEffect)
│   ├── Redux (useDispatch, useSelector)
│   ├── Material-UI (Dialog, TextField, Autocomplete, DatePicker)
│   ├── dayjs (date formatting)
│   └── react-toastify (notifications)
│
├── Redux Actions
│   ├── getAllEmployees() ................... Fetch employee list
│   ├── updateSubStage() .................... Update substage
│   ├── getActiveSubStagesByStageId() ....... Refresh substages
│   ├── fetchSingleStageById() .............. Refresh stage
│   └── fetchProjectById() .................. Refresh project
│
└── Props
    ├── open (boolean) ...................... Modal visibility
    ├── onClose (function) .................. Close handler
    ├── substage (object) ................... Substage data
    ├── stageId (string) .................... Stage identifier
    └── projectNumber (string) .............. Project identifier
```

---

## 📦 Module Exports

### EditStageModal.jsx
```javascript
export default EditStageModal

// Usage:
import EditStageModal from '../EditStage/EditStageModal.jsx'

<EditStageModal
  open={editStageModalOpen}
  onClose={() => setEditStageModalOpen(false)}
  stage={selectedStage}
  projectNumber={pNo}
/>
```

### EditSubstageModal.jsx
```javascript
export default EditSubstageModal

// Usage:
import EditSubstageModal from '../EditSubstage/EditSubstageModal.jsx'

<EditSubstageModal
  open={editSubstageModalOpen}
  onClose={() => setEditSubstageModalOpen(false)}
  substage={selectedSubstage}
  stageId={sNo}
  projectNumber={pNo}
/>
```

---

## 🎯 Component Responsibilities

### MyProject.jsx
- **Primary:** Display project and stages
- **Added:** Stage edit button & modal integration
- **Responsibilities:**
  - Render stage cards
  - Handle edit button clicks
  - Manage modal state
  - Pass stage data to modal

### MyStage.jsx
- **Primary:** Display stage and substages
- **Added:** Substage edit handler
- **Responsibilities:**
  - Render substage tree
  - Handle edit requests from tree nodes
  - Manage modal state
  - Pass substage data to modal

### SubstageTreeNode.jsx
- **Primary:** Render substage in tree structure
- **Added:** Edit button & click handler
- **Responsibilities:**
  - Display substage information
  - Provide action buttons
  - Handle edit button clicks
  - Propagate edit event to parent

### EditStageModal.jsx
- **Primary:** Stage editing interface
- **Responsibilities:**
  - Render form fields
  - Load employee data
  - Validate form input
  - Dispatch update action
  - Handle success/error
  - Close modal on save

### EditSubstageModal.jsx
- **Primary:** Substage editing interface
- **Responsibilities:**
  - Render form fields
  - Load employee data
  - Validate form input
  - Dispatch update action
  - Handle success/error
  - Close modal on save

---

**Component architecture is modular, maintainable, and follows React best practices.**
