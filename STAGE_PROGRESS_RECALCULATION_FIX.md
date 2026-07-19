# Stage Progress Recalculation Fix

## Problem

After adding new substages, the stage progress on "My Project" page was not updating correctly:
- My Project page showed "Guard" at 100% (stale data)
- My Stage page showed "Guard" at 0% with incomplete substages (correct data)

## Root Causes

### Issue 1: Missing Stage Progress Recalculation
The `createSubStage` function was:
- ✅ Creating the new substage
- ✅ Updating parent substage completion (recursive ancestors)
- ❌ **NOT recalculating stage progress** after adding substage

Result: Stage remained at 100% even though it now had incomplete substages.

### Issue 2: Frontend Not Auto-Refreshing
The My Project page was only fetching data:
- On initial mount
- When project number changed
- ❌ **NOT when navigating back** from editing substages

## Solutions Implemented

### Backend Fix: Add Stage Progress Recalculation

Modified `createSubStage` function in `substage.controller.js`:

```javascript
// After creating substage, recalculate stage progress
db.query(stageQuery, values, (err, data) => {
  if (err) { /* error handling */ }

  // NEW: Recalculate stage progress
  const stageId = req.body.stageId
  const projectNumber = req.body.projectNumber

  // 1. Count completed vs total substages
  db.query(
    'SELECT COUNT(*) as total, SUM(isCompleted) as completed FROM substage WHERE stageId = ? AND historyOf IS NULL',
    [stageId],
    (err, stats) => {
      const total = stats[0].total || 1
      const completed = stats[0].completed || 0
      const stageProgress = Math.round((completed / total) * 100)

      // 2. Update stage progress
      db.query(
        'UPDATE stage SET progress = ? WHERE stageId = ?',
        [stageProgress, stageId],
        (err) => {
          console.log(`Stage ${stageId} progress updated to ${stageProgress}%`)

          // 3. Recalculate project progress (average of all stages)
          if (projectNumber) {
            db.query(
              'SELECT AVG(progress) as avgProgress FROM stage WHERE projectNumber = ? AND historyOf IS NULL',
              [projectNumber],
              (err, projStats) => {
                const projectProgress = Math.round(projStats[0].avgProgress || 0)
                db.query(
                  'UPDATE project SET progress = ? WHERE projectNumber = ?',
                  [projectProgress, projectNumber],
                  (err) => {
                    console.log(`Project ${projectNumber} progress updated to ${projectProgress}%`)
                  }
                )
              }
            )
          }
        }
      )

      // Return success response
      res.status(201).json(new ApiResponse(201, data, 'Substage created successfully'))
    }
  )
})
```

### Frontend Fix: Auto-Refresh My Project Page

Added periodic refresh to `MyProject.jsx`:

```javascript
// Refresh data periodically and when tab becomes visible
useEffect(() => {
  let intervalId

  const refreshData = () => {
    dispatch(fetchActiveStagesByProjectNumber(pNo))
    dispatch(fetchProjectById(pNo))
  }

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Page became visible, refresh immediately
      refreshData()
    }
  }

  // Refresh every 5 seconds when page is visible
  intervalId = setInterval(() => {
    if (!document.hidden) {
      refreshData()
    }
  }, 5000)

  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange)

  return () => {
    clearInterval(intervalId)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [dispatch, pNo])
```

## How It Works Now

### Complete Flow When Adding Substage

```
1. User adds "testv2" (16%) under "Guard" stage
        ↓
2. Backend: createSubStage() executes
        ↓
3. Backend: Recursive ancestor update
   - Mark parent substages incomplete (if any)
   - Update grandparents, great-grandparents, etc.
        ↓
4. Backend: Insert new substage into database
        ↓
5. Backend: Recalculate stage progress ← NEW!
   - Query: COUNT completed vs total substages
   - Guard has: 0 completed / 3 total = 0%
   - UPDATE stage SET progress = 0 WHERE stageId = Guard
        ↓
6. Backend: Recalculate project progress ← NEW!
   - Query: AVG of all stage progresses
   - UPDATE project SET progress = X
        ↓
7. Backend: Return success response
        ↓
8. Frontend: UpdateProject saves changes
        ↓
9. Frontend: Refreshes substages
        ↓
10. Frontend: Navigate back to My Project
        ↓
11. Frontend: Auto-refresh (within 5 seconds) ← NEW!
    - Fetch latest stages (Guard now shows 0%)
    - Fetch latest project data
        ↓
12. User sees updated progress ✓
```

## Testing Instructions

### **IMPORTANT: Restart Backend Server!**

The changes to `substage.controller.js` require a backend restart:

```bash
# Stop your backend server (Ctrl+C)
# Then restart it:
cd backend
node index.js
# or
npm start
```

### Test Scenario 1: Add New Substage

1. **Backend should be restarted**
2. Go to My Project page
3. Note a stage's progress (e.g., "Guard at 100%")
4. Click "Edit Project" or go to Update Project
5. Expand the stage
6. Add a new substage with progress < 100%
7. Click "Save Changes"
8. Navigate back to My Project
9. **Within 5 seconds**: Stage progress should update automatically

**Expected Result:**
- Backend logs show:
  ```
  Creating substage with values: [...]
  Ancestor substage X marked as incomplete due to new descendant
  Stage X progress updated to Y%
  Project X progress updated to Z%
  ```
- Frontend shows updated stage progress on My Project page

### Test Scenario 2: Edit Substage Progress

1. Go to My Stage (click on a stage)
2. Edit a substage's progress (click edit icon)
3. Change progress value
4. Navigate back to My Project
5. **Within 5 seconds**: Stage progress updates

**Expected Result:**
- Stage progress recalculates based on average of substage progresses
- Project progress recalculates based on average of stage progresses

### Test Scenario 3: Mark Substage Complete

1. Go to My Stage
2. Check a substage's completion checkbox
3. Provide executed dates
4. Navigate back to My Project
5. **Within 5 seconds**: Stage progress updates

**Expected Result:**
- Stage progress increases
- If all substages complete, stage shows 100%

## Verification Checklist

After restarting backend:

- [ ] Backend starts without errors
- [ ] Can add new substages
- [ ] Backend logs show "Stage X progress updated to Y%"
- [ ] Backend logs show "Project X progress updated to Z%"
- [ ] My Project page refreshes automatically (see network tab: requests every 5s)
- [ ] Stage progress matches substage completion counts
- [ ] Project progress updates when stage progress changes

## Files Modified

### Backend
- ✅ `backend/controllers/substage.controller.js`
  - Added stage progress recalculation in `createSubStage()`
  - Added project progress recalculation in `createSubStage()`

### Frontend
- ✅ `frontend/src/components/Project/MyProject/MyProject.jsx`
  - Added `useLocation` import
  - Added periodic refresh (5 seconds)
  - Added visibility change listener

## Backend Logs to Look For

When everything is working correctly, you'll see:

```
Creating substage with data: { substagename: 'testv2', ... }
Ancestor substage 456 marked as incomplete due to new descendant
Stage 123 progress updated to 0%
Project PRJ001 progress updated to 33%
```

## Expected Progress Calculations

### Stage Progress
```
Formula: (Completed Substages / Total Substages) × 100

Example - Guard Stage:
- seq: 0% incomplete
- checking: 0% incomplete  
- testv2: 16% incomplete

Completed: 0
Total: 3
Stage Progress: (0 / 3) × 100 = 0%
```

### Project Progress
```
Formula: AVG(All Stage Progresses)

Example - B Building Project:
- Teacher: 100% complete
- Student1: 100% complete
- Guard: 0% incomplete

Project Progress: (100 + 100 + 0) / 3 = 66.67% ≈ 67%
```

## Common Issues

### Issue: Stage still shows old progress

**Solution:**
1. Restart backend server (critical!)
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R)
4. Wait 5 seconds for auto-refresh

### Issue: Backend logs don't show progress updates

**Solution:**
1. Verify backend was restarted after code changes
2. Check for syntax errors in controller file
3. Verify database connection is working

### Issue: Frontend doesn't refresh

**Solution:**
1. Check browser console for errors
2. Verify network tab shows periodic GET requests
3. Restart frontend dev server

## Success Criteria

✅ Backend calculates stage progress after adding substage  
✅ Backend calculates project progress after stage update  
✅ Backend logs show progress updates  
✅ Frontend auto-refreshes every 5 seconds  
✅ Frontend refreshes immediately when tab becomes visible  
✅ My Project page shows correct stage progress  
✅ No manual page refresh needed  

---

**Fix Status**: ✅ COMPLETED - Stage progress now recalculates automatically + frontend auto-refreshes

**Action Required**: 🔴 **RESTART BACKEND SERVER** before testing!
