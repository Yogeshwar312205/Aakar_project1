# Testing Guide: Parent Substage Completion Fix

## Overview
This fix ensures that when a new child substage is added under a completed parent substage, the parent is automatically marked as incomplete.

## Test Environment Setup

### Prerequisites
1. Backend server running on configured port
2. Frontend development server running
3. MySQL database connected and accessible
4. User logged in with appropriate project management permissions

### Required Access Permissions
- Project Management → Substage Management → Add Access
- Project Management → Substage Management → Update Access
- Project Management → Substage Management → Read Access

## Test Scenarios

### Scenario 1: Add Child to Completed Parent Substage

#### Setup
1. Navigate to **Project Management** → **Update Project**
2. Select a project that has at least one stage with substages
3. Expand a stage to view its substages
4. If no completed parent exists, create one:
   - Add a parent substage (e.g., "Test Parent")
   - Add at least one child substage under it
   - Mark all children as complete (100% progress)
   - Mark the parent as complete (checkbox checked, 100% progress)

#### Test Steps
1. Verify the parent substage shows:
   - ✓ Checkmark (completed)
   - 100% progress bar
   - Green "✓ Done" badge
   - Executed start and end dates

2. Click "Add child substage" button under the completed parent

3. Fill in new substage details:
   - **Substage Name**: "New Test Child"
   - **Start Date**: Any valid date
   - **End Date**: Any valid date
   - **Owner**: Select from dropdown
   - **Machine**: Enter machine name (optional)
   - **Duration**: Auto-calculated from dates
   - **Progress**: 0% or any value < 100%

4. Click "Save" to add the substage to pending state

5. **IMMEDIATE CHECK** (Before clicking "Save Changes"):
   - Toast message: "Substage added (pending save). Parent marked as incomplete."
   - Parent should visually update in the pending state

6. Click "Save Changes" button to persist to database

7. Wait for success toast: "Project updated successfully!"

#### Expected Results After Save
✅ **Parent Substage Status:**
- Checkmark removed (unchecked)
- Progress bar shows 0% or less than 100%
- Status badge shows "X/Y done" where X < Y
- Executed dates cleared (no longer displayed)

✅ **Child Substage Status:**
- New child appears in the tree
- Shows as incomplete
- Has the details you entered

✅ **Database Changes:**
- Parent: `isCompleted = 0`, `progress = 0`, `executedStartDate = NULL`, `executedEndDate = NULL`
- Child: New record created with provided details

#### Why This Matters
A parent with incomplete children cannot be considered complete. The system enforces this rule bidirectionally:
- You can't mark a parent complete if children are incomplete
- Adding a new incomplete child makes a completed parent incomplete

---

### Scenario 2: Add Multiple Children to Same Parent

#### Setup
Same as Scenario 1 - completed parent substage

#### Test Steps
1. Add first child (follow Scenario 1 steps 1-7)
2. Verify parent is now incomplete
3. Add second child under the same parent
4. Click "Save Changes"

#### Expected Results
✅ Parent remains incomplete
✅ Both children appear in tree
✅ Parent status shows "0/2 done" or similar

---

### Scenario 3: Add Child to Already Incomplete Parent

#### Setup
1. Navigate to Update Project
2. Find or create a parent substage that is already incomplete (has at least one incomplete child)

#### Test Steps
1. Note parent's current progress (e.g., 50%)
2. Add a new child substage
3. Click "Save Changes"

#### Expected Results
✅ Parent remains incomplete (no change in completion status)
✅ New child added successfully
✅ Parent progress may be recalculated based on total children

---

### Scenario 4: Nested Substages (Multi-Level)

#### Setup
1. Create a hierarchy: Parent → Child1 (has sub-children) → Grandchild
2. Mark all grandchildren and Child1 as complete
3. Mark Parent as complete

#### Test Steps
1. Add a new grandchild under Child1
2. Click "Save Changes"

#### Expected Results
✅ **Child1** is marked incomplete (direct parent)
✅ **Parent** remains completed (its direct child Child1 logic is independent)
✅ Note: Each parent only checks its direct children

---

### Scenario 5: Backend-Only Test (API)

#### Using Postman/cURL
```bash
POST http://localhost:PORT/api/substages
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "stageId": 123,
  "parentSubstageId": 456,  // ID of completed parent
  "substagename": "API Test Child",
  "startDate": "2025-01-01",
  "endDate": "2025-01-15",
  "owner": "John Doe(EMP001)",
  "machine": "Machine A",
  "duration": 14,
  "progress": 0,
  "projectNumber": "PRJ001",
  "seqPrevStage": null
}
```

#### Expected Response
```json
{
  "statusCode": 201,
  "message": "Substage created successfully",
  "data": { ... }
}
```

#### Verify in Database
```sql
SELECT substageId, substageName, isCompleted, progress, executedStartDate, executedEndDate
FROM substage
WHERE substageId = 456;  -- Parent ID
```

**Expected Values:**
- `isCompleted`: 0
- `progress`: 0
- `executedStartDate`: NULL
- `executedEndDate`: NULL

---

## Regression Tests

### RT-1: Ensure Completing Children Allows Parent Completion
1. Add children to incomplete parent
2. Mark all children as complete
3. Try to mark parent as complete

**Expected**: ✅ Parent can be marked complete

### RT-2: Ensure Deletion Works Correctly
1. Add child to completed parent (parent becomes incomplete)
2. Delete the newly added child
3. Check parent status

**Expected**: ✅ Parent status depends on remaining children

### RT-3: Verify Stage Progress Updates
1. Add child to completed parent in a stage
2. Save changes
3. Check stage progress

**Expected**: ✅ Stage progress recalculates based on substage completion

---

## Common Issues & Troubleshooting

### Issue: Parent Still Shows as Completed After Adding Child

**Possible Causes:**
1. Frontend not refreshing after save
2. Backend update query not executing
3. Cache issue in browser

**Solutions:**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Check backend logs for "Parent substage marked as incomplete due to new child"
- Verify database directly with SQL query

### Issue: Changes Not Persisting

**Possible Causes:**
1. Not clicking "Save Changes" button
2. Network error during save
3. Permission denied

**Solutions:**
- Ensure "Save Changes" is clicked (substages are pending until then)
- Check network tab for failed requests
- Verify user has substage.add permission

### Issue: Page Doesn't Refresh After Save

**Possible Causes:**
1. Missing dispatch call
2. Redux state not updating

**Solutions:**
- Check code includes `await dispatch(getActiveSubStagesByStageId(selectedStageId)).unwrap()`
- Verify Redux DevTools for state updates

---

## Success Criteria

### All Tests Pass When:
- ✅ Backend marks parent as incomplete when child is added
- ✅ Frontend shows immediate feedback (pending state update)
- ✅ After save, data refreshes and reflects backend changes
- ✅ Parent checkmark and progress update correctly
- ✅ Executed dates are cleared from parent
- ✅ No errors in console or backend logs
- ✅ Database values match expected results

---

## Performance Considerations

### Expected Performance
- Adding child: < 100ms for UI update (pending state)
- Saving to DB: < 500ms per substage
- Refreshing data: < 1s for typical project size

### If Slow:
- Check database indexes on `substageId` and `parentSubstageId`
- Monitor network latency
- Check for N+1 query issues in backend

---

## Rollback Plan

If issues occur in production:

1. **Backend Rollback**: Remove the `updateParentCompletion` logic from `createSubStage`
2. **Frontend Rollback**: Revert changes to `handleAddSubstage` and `handleSave`
3. **Database**: No schema changes were made, so no migration needed

---

## Approval Checklist

Before marking this fix as complete:
- [ ] All 5 test scenarios pass
- [ ] Regression tests pass
- [ ] No console errors
- [ ] Backend logs show expected messages
- [ ] Database queries return expected values
- [ ] UI updates correctly in real-time
- [ ] Works across different user permission levels
- [ ] Performance is acceptable (< 1s for full cycle)
- [ ] Documentation updated
- [ ] Code review completed
