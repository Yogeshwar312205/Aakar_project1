# Testing Real-Time Access Update Feature

## Prerequisites
1. Backend server running on `http://localhost:3000`
2. Frontend server running on `http://localhost:5173`
3. At least 2 employee accounts:
   - One admin account
   - One regular employee account

## Test 1: Real-Time Access Permission Update

### Setup
1. Open two browser windows (or use two different browsers)
2. Window 1: Log in as **Admin**
3. Window 2: Log in as **Regular Employee** (e.g., Alice)

### Steps
1. **Window 2 (Employee)**:
   - Note current access permissions
   - Open browser console (F12) to see logs
   - Stay on any page (e.g., Home or Profile)

2. **Window 1 (Admin)**:
   - Go to HR Management → Employees
   - Click on the employee (Alice) that's logged in Window 2
   - Click "Edit" button
   - Scroll to "Manage Access" section
   - Make a visible change (e.g., toggle "Project Management" or change a specific permission)
   - Click "Save"
   - Wait for success message

3. **Window 2 (Employee) - Wait 10 seconds**:
   - Should see a toast notification: "Your access permissions have been updated."
   - In console, should see: `🔄 Access permissions updated`
   - Navigate to different pages to verify new permissions are applied
   - **No logout required!**

### Expected Results
✅ Toast notification appears after ~10 seconds
✅ New permissions reflected immediately in UI
✅ Sidebar menu items update based on new access
✅ No logout/login needed
✅ Access persists after page refresh

### Failure Scenarios
❌ No notification after 15+ seconds → Check backend logs
❌ Notification but UI doesn't update → Check Redux DevTools
❌ Access reverts after refresh → Check localStorage update

---

## Test 2: Account Deactivation Detection

### Setup
1. Open two browser windows
2. Window 1: Log in as **Admin**
3. Window 2: Log in as **Regular Employee** (e.g., Bob)

### Steps
1. **Window 2 (Employee)**:
   - Stay logged in on any page
   - Keep browser console open

2. **Window 1 (Admin)**:
   - Go to HR Management → Employees
   - Find the employee logged in Window 2 (Bob)
   - Click "Delete" or "Deactivate"
   - Confirm deletion

3. **Window 2 (Employee) - Wait 10 seconds**:
   - Should see toast notification: "Your account has been deactivated. Please contact HR."
   - Should be automatically logged out
   - Should be redirected to login page
   - Redux state cleared
   - localStorage cleared

### Expected Results
✅ Auto-logout after ~10 seconds
✅ Clear error message shown
✅ Redirect to login page
✅ Cannot log back in with same credentials
✅ Login attempt shows: "Account has been deactivated. Please contact HR."

---

## Test 3: Immediate Login Block for Deactivated Account

### Steps
1. **Admin**: Delete/deactivate an employee account
2. **Employee**: Try to log in with that account's credentials
3. Should see error immediately (no waiting)
4. Error message: "Account has been deactivated. Please contact HR."

### Expected Results
✅ Login denied immediately
✅ Clear error message
✅ No token issued
✅ Cannot access any protected routes

---

## Test 4: Multiple Access Changes in Short Time

### Steps
1. Window 1: Admin
2. Window 2: Employee logged in
3. Admin makes 3-4 rapid access changes (within 30 seconds)
4. Employee window should:
   - Show one notification for each distinct change
   - Update access after each poll cycle
   - Not show duplicate notifications

---

## Test 5: Polling Behavior Verification

### Steps
1. Log in as employee
2. Open browser console (F12)
3. Go to Network tab
4. Filter by "access"
5. Observe requests:
   - Should see GET request to `/api/v1/employee/:id/access` every ~10 seconds
   - Should be authenticated (cookies sent)
   - Response should contain current access string

### Expected Results
✅ Regular 10-second intervals
✅ No errors in console
✅ Clean start/stop on login/logout
✅ No duplicate requests

---

## Test 6: Page Refresh During Active Session

### Steps
1. Log in as employee
2. Admin changes employee's access
3. Wait for notification in employee window
4. **Refresh the page (F5)**
5. Check if access is still updated
6. Verify polling resumes after refresh

### Expected Results
✅ Updated access persists after refresh
✅ Polling resumes automatically
✅ No duplicate polling intervals

---

## Debugging Tips

### Check Backend Logs
Look for:
```
Fetching access for employee: <employeeId>
Employee access: <access_string>
Account deactivated: <true/false>
```

### Check Frontend Console
Look for:
```
🔄 Access permissions updated
Fetching projects for employee: <id>
Updated Access String: <string>
```

### Redux DevTools
1. Install Redux DevTools extension
2. Check `state.auth.user.employeeAccess`
3. Watch for `auth/fetchEmployeeAccess/fulfilled` actions
4. Verify state updates

### localStorage
Open console and run:
```javascript
JSON.parse(localStorage.getItem('authData'))
```
Should show current employee data with updated access.

---

## Performance Monitoring

### Check API Response Time
- Access check should be < 50ms
- No database locks or slowdowns
- Minimal server load

### Check Memory Leaks
1. Keep employee window open for 5+ minutes
2. Check memory usage in Task Manager
3. Should remain stable (no gradual increase)

### Check Cleanup on Logout
1. Log in
2. Wait 30 seconds (3 polling cycles)
3. Log out
4. Verify no more API calls after logout

---

## Common Issues & Solutions

### Issue: No toast notification
**Solution**: Check if ToastContainer is rendered in App.jsx

### Issue: API returns 401 Unauthorized
**Solution**: Verify cookies are being sent (`withCredentials: true`)

### Issue: Polling continues after logout
**Solution**: Check useEffect cleanup in useAccessSync.js

### Issue: Multiple notifications for one change
**Solution**: Verify lastAccessRef comparison logic

### Issue: Access updates but UI doesn't reflect
**Solution**: Check if components are reading from Redux state

---

## Success Criteria

All tests should pass with:
- ✅ Real-time updates within 10 seconds
- ✅ Smooth user experience with notifications
- ✅ Automatic logout on deactivation
- ✅ No performance degradation
- ✅ Clean polling behavior
- ✅ Proper cleanup on unmount
- ✅ Persistence across page refreshes
