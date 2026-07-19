# Employee Projects Display - Debug Fix

## Issue
HR Management employee profile shows "Loading..." indefinitely when trying to display employee projects.

## Changes Made

### 1. Enhanced Frontend Logging (`EmployeeProfile.jsx`)
Added detailed console logging to track:
- Employee ID being used
- Full API URL being called
- Response status codes
- Actual data received
- Any errors encountered

### 2. Enhanced Backend Logging (`project.controller.js`)
Added detailed console logging to track:
- Incoming `customEmployeeId` parameter
- Employee lookup results
- Found `employeeId` conversion
- SQL query execution
- Number of projects found
- Any database errors

### 3. Fixed SQL Query
Updated the SQL query to properly filter out history records:
```sql
SELECT DISTINCT p.*
FROM project p
LEFT JOIN stage s ON p.projectNumber = s.projectNumber AND s.historyOf IS NULL
LEFT JOIN substage ss ON p.projectNumber = ss.projectNumber AND ss.historyOf IS NULL
WHERE (s.owner = ? OR ss.owner = ?) AND p.historyOf IS NULL
ORDER BY p.startDate DESC
```

The key fix: Added `AND s.historyOf IS NULL` and `AND ss.historyOf IS NULL` to the JOIN conditions to prevent duplicate records from historical stages/substages.

## How to Debug

### Step 1: Check Backend is Running
Backend server should be running on port 3000. Current PID: 18308

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to HR Management → Click on an employee
4. Look for these log messages:
   - "Fetching projects for employee: [ID]"
   - "Fetching from URL: [URL]"
   - "Response status: [status]"
   - "Received projects data: [data]"

### Step 3: Check Backend Console
Look for these log messages in the backend console:
- "=== getProjectsByEmployeeId called ==="
- "customEmployeeId: [ID]"
- "Found employeeId: [ID]"
- "Found projects count: [number]"
- "Returning projects: [number]"

## Common Issues & Solutions

### Issue: "Employee not found"
- **Cause**: The `customEmployeeId` from URL doesn't match any employee in database
- **Solution**: Verify the employee ID in the URL matches the database

### Issue: "Error retrieving projects" 
- **Cause**: Database query failed
- **Solution**: Check backend console for SQL errors, verify database connection

### Issue: Empty projects list but no errors
- **Cause**: Employee is not assigned as owner of any stages or substages
- **Solution**: This is expected behavior - assign employee to stages/substages

### Issue: Network error / CORS error
- **Cause**: Backend server not running or wrong BASE_URL
- **Solution**: 
  - Verify backend is running: `netstat -ano | findstr :3000`
  - Check `frontend/src/constants.js` for correct `BASE_URL`

## Testing

1. **Test with employee who has projects**:
   - Go to Projects → Select a project → View stages
   - Note the employee assigned to stages
   - Go to HR Management → Click that employee
   - Should see projects list

2. **Test with employee who has no projects**:
   - Go to HR Management → Click an unassigned employee
   - Should see message: "This employee is not assigned to any projects yet."

3. **Test with invalid employee ID**:
   - Manually change URL to invalid ID
   - Should see "Employee not found" error in console

## Files Modified
- `backend/controllers/project.controller.js` - Enhanced logging + SQL fix
- `frontend/src/pages/employee/EmployeeProfile.jsx` - Enhanced logging
- `backend/routes/project.routes.js` - Route already added (no change needed)

## Next Steps After Testing
Once confirmed working, the verbose console.log statements can be removed or reduced to only show errors.
