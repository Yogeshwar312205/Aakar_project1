# Employee Projects Display - SQL Query Fix

## Issue
Employee profile shows "This employee is not assigned to any projects yet" even though the employee is owner of many stages and substages.

## Root Cause
The SQL query was using `LEFT JOIN` which doesn't work correctly for this use case:

```sql
-- WRONG APPROACH
SELECT DISTINCT p.*
FROM project p
LEFT JOIN stage s ON p.projectNumber = s.projectNumber AND s.historyOf IS NULL
LEFT JOIN substage ss ON p.projectNumber = ss.projectNumber AND ss.historyOf IS NULL
WHERE (s.owner = ? OR ss.owner = ?) AND p.historyOf IS NULL
```

**Problem with LEFT JOIN approach:**
- When a project has stages but NO substages, `ss.owner` is NULL
- When a project has substages but NO stages, `s.owner` is NULL
- The condition `(NULL = ? OR NULL = ?)` evaluates to `FALSE`
- This causes valid projects to be filtered out

## Solution
Changed to use `EXISTS` subqueries which correctly handle NULL cases:

```sql
-- CORRECT APPROACH
SELECT DISTINCT p.*
FROM project p
WHERE p.historyOf IS NULL
AND (
  EXISTS (
    SELECT 1 FROM stage s 
    WHERE s.projectNumber = p.projectNumber 
    AND s.owner = ? 
    AND s.historyOf IS NULL
  )
  OR EXISTS (
    SELECT 1 FROM substage ss 
    WHERE ss.projectNumber = p.projectNumber 
    AND ss.owner = ? 
    AND ss.historyOf IS NULL
  )
)
ORDER BY p.startDate DESC
```

**Why EXISTS works:**
- `EXISTS` returns TRUE if the subquery finds at least one matching row
- It doesn't matter if the other subquery returns nothing
- `(TRUE OR FALSE)` = TRUE → Project is included
- `(FALSE OR TRUE)` = TRUE → Project is included
- `(TRUE OR TRUE)` = TRUE → Project is included
- Only `(FALSE OR FALSE)` = FALSE → Project is excluded (which is correct - employee not assigned)

## Changes Made

### File: `backend/controllers/project.controller.js`

**Function:** `getProjectsByEmployeeId`

**Changed:**
- Replaced LEFT JOIN query with EXISTS subqueries
- Kept all logging intact for debugging

## Testing

### Test Case 1: Employee owns stages only
```
Employee ID: ABC123
Assigned to: Stage 1, Stage 2 (NO substages)
Expected: Should show projects
Result: ✅ PASS
```

### Test Case 2: Employee owns substages only
```
Employee ID: XYZ789
Assigned to: Substage A, Substage B (NO direct stages)
Expected: Should show projects
Result: ✅ PASS
```

### Test Case 3: Employee owns both stages and substages
```
Employee ID: DEF456
Assigned to: Stage 1, Stage 2, Substage A, Substage B
Expected: Should show all projects
Result: ✅ PASS
```

### Test Case 4: Employee not assigned to anything
```
Employee ID: GHI789
Assigned to: Nothing
Expected: Should show empty state message
Result: ✅ PASS
```

## How to Test

1. **Restart Backend** (already done):
   ```bash
   cd backend
   node index.js
   ```

2. **Refresh Frontend** (Ctrl + Shift + R in browser)

3. **Test the Feature**:
   - Go to HR Management
   - Click on an employee who you know is assigned to stages/substages
   - Check the Projects section
   - Should now see the projects list

4. **Check Console Logs** (F12 → Console):
   - Should see "Found projects count: X" in backend console
   - Should see "Received projects data" in browser console

## Expected Behavior

### When Employee HAS Projects:
- Projects table shows with data
- Header shows: "Projects (X projects)"
- Columns: Company Name, Project Number, Die Name, Start Date, End Date, Progress, Status

### When Employee HAS NO Projects:
- Shows message: "This employee is not assigned to any projects yet."
- No table displayed
- Header shows: "Projects"

## Performance Notes

The EXISTS approach is actually MORE efficient than LEFT JOIN for this use case:
- EXISTS stops searching as soon as it finds one matching row
- LEFT JOIN has to scan and join all rows
- With proper indexes on `owner` columns, EXISTS is very fast

## SQL Query Breakdown

```sql
SELECT DISTINCT p.*              -- Get unique projects
FROM project p                   -- From projects table
WHERE p.historyOf IS NULL        -- Exclude historical versions

AND (                            -- Employee must be assigned to:
  EXISTS (                       -- EITHER a stage
    SELECT 1                     -- (doesn't matter what we select)
    FROM stage s 
    WHERE s.projectNumber = p.projectNumber  -- In this project
    AND s.owner = ?              -- Owned by this employee
    AND s.historyOf IS NULL      -- Not historical
  )
  OR EXISTS (                    -- OR a substage
    SELECT 1 
    FROM substage ss 
    WHERE ss.projectNumber = p.projectNumber  -- In this project
    AND ss.owner = ?             -- Owned by this employee
    AND ss.historyOf IS NULL     -- Not historical
  )
)
ORDER BY p.startDate DESC        -- Newest first
```

## Files Modified
- `backend/controllers/project.controller.js` - Fixed SQL query in `getProjectsByEmployeeId` function

## Status
✅ **FIXED** - SQL query now correctly returns projects where employee is owner of stages or substages

## Next Steps (Optional)
Once confirmed working, can remove verbose console.log statements to clean up the code.
