# Real-Time Access Update Implementation

## Problem
When an admin changed an employee's access permissions, the changes only took effect after the employee logged out and logged back in. This created a poor user experience and security concerns.

## Solution Overview
Implemented a real-time access synchronization system that:
1. Periodically checks for access changes every 10 seconds
2. Updates Redux state and localStorage immediately when changes are detected
3. Automatically logs out users whose accounts have been deactivated
4. Shows notifications to users when their permissions change

## Changes Made

### Backend

#### 1. New Controller Function: `getCurrentEmployeeAccess`
**File**: `backend/controllers/employee.controller.js`

```javascript
export const getCurrentEmployeeAccess = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    
    // Fetch current employeeAccess from database
    // Check if account is deactivated (employeeEndDate)
    // Return access string or deactivation status
});
```

**Features**:
- Fetches current `employeeAccess` from database
- Checks if account has been deactivated (`employeeEndDate <= today`)
- Returns 403 status if deactivated
- Returns current access string if active

#### 2. New API Route
**File**: `backend/routes/employee.route.js`

```javascript
router.get('/:employeeId/access', authMiddleware, getCurrentEmployeeAccess)
```

**Endpoint**: `GET /api/v1/employee/:employeeId/access`
**Auth**: Required (cookie-based)

### Frontend

#### 1. Updated Auth Slice
**File**: `frontend/src/features/authSlice.js`

**New Thunk**: `fetchEmployeeAccess`
- Makes API call to check current access
- Handles deactivated accounts
- Returns current access string

**New Reducer**: `updateEmployeeAccess`
- Updates user state in Redux
- Updates localStorage
- Keeps authentication state in sync

**New Extra Reducers**:
- `fetchEmployeeAccess.fulfilled`: Updates access if changed
- `fetchEmployeeAccess.rejected`: Logs out if account deactivated

#### 2. Custom Hook: `useAccessSync`
**File**: `frontend/src/hooks/useAccessSync.js`

**Features**:
- Runs only when user is authenticated
- Polls API every 10 seconds
- Compares new access with previous access
- Shows toast notification when access changes
- Automatically logs out deactivated users
- Cleans up on unmount

**Implementation**:
```javascript
const useAccessSync = () => {
    // Check access every 10 seconds
    // Update Redux if changed
    // Show notification
    // Handle deactivation
}
```

#### 3. App Integration
**File**: `frontend/src/App.jsx`

Added `useAccessSync()` hook at the top level:
```javascript
const App = () => {
    const { isAuthenticated } = useSelector((state) => state.auth)
    
    // Enable real-time access sync for all authenticated users
    useAccessSync()
    
    return (...)
}
```

## How It Works

### Access Update Flow

1. **Admin changes employee access**:
   - Admin updates access in EditEmployee page
   - Access saved to database via `PUT /api/v1/employee/:id/with-relations`

2. **Real-time detection** (for logged-in employee):
   - Every 10 seconds, `useAccessSync` calls `fetchEmployeeAccess`
   - Backend fetches current `employeeAccess` from database
   - Frontend compares with previous value

3. **Update if changed**:
   - If access string is different, update Redux state
   - Update localStorage to persist across page refreshes
   - Show toast notification: "Your access permissions have been updated"

4. **User sees changes immediately**:
   - All components reading from Redux get updated access
   - No logout/login required
   - Sidebar, navigation, and access controls update automatically

### Deactivation Flow

1. **Admin deletes employee**:
   - Sets `employeeEndDate = CURRENT_DATE`
   
2. **Detection**:
   - `useAccessSync` detects deactivation in next poll
   - OR login attempt is blocked by `loginEmployee` validation

3. **Auto-logout**:
   - Clear Redux state
   - Clear localStorage
   - Redirect to login page
   - Show error: "Your account has been deactivated. Please contact HR."

## Technical Details

### Polling Interval
- **10 seconds** between checks
- Balances responsiveness vs server load
- Can be adjusted in `useAccessSync.js` if needed

### State Management
- **Redux**: Primary source of truth during session
- **localStorage**: Persistence across page reloads
- Both updated simultaneously for consistency

### Performance
- Minimal overhead (~1 database query every 10 seconds per user)
- Request only fetches 2 fields: `employeeAccess`, `employeeEndDate`
- Uses existing authentication (no extra tokens)

### Security
- Endpoint protected by `authMiddleware`
- Cookie-based authentication required
- Employee can only fetch their own access
- Deactivated accounts immediately logged out

## Testing Steps

### Test Access Update
1. Log in as Employee A in one browser
2. Log in as Admin in another browser
3. Admin: Go to Employee A's profile → Edit
4. Admin: Change access permissions (toggle any module)
5. Admin: Save changes
6. **Wait 10 seconds**
7. Employee A: Should see toast notification
8. Employee A: Access changes should be reflected immediately

### Test Account Deactivation
1. Log in as Employee B
2. Admin: Delete Employee B from employee dashboard
3. **Wait 10 seconds**
4. Employee B: Should be automatically logged out
5. Employee B: Should see "Account deactivated" message
6. Employee B: Cannot log back in

### Test Login Block
1. Admin: Delete Employee C
2. Try to log in as Employee C
3. Should see: "Account has been deactivated. Please contact HR."

## Files Modified

### Backend
- `backend/controllers/employee.controller.js` - Added `getCurrentEmployeeAccess`, updated `loginEmployee`
- `backend/routes/employee.route.js` - Added access check route

### Frontend
- `frontend/src/features/authSlice.js` - Added thunk, reducer, and extra reducers
- `frontend/src/hooks/useAccessSync.js` - New custom hook (created)
- `frontend/src/App.jsx` - Integrated useAccessSync hook

## Benefits

1. **Immediate Effect**: Access changes apply within 10 seconds
2. **Better UX**: No logout/login required
3. **Security**: Deactivated users automatically logged out
4. **Transparency**: Users notified when permissions change
5. **Reliability**: Works across page refreshes (localStorage)
6. **Performance**: Efficient polling with minimal overhead

## Future Enhancements (Optional)

1. **WebSocket Integration**: Real-time updates (0 second delay)
2. **Configurable Polling**: Admin setting for poll interval
3. **Access Change History**: Log when/why access was changed
4. **Granular Notifications**: Specify which permissions changed
5. **Admin Dashboard**: See all logged-in users and their current access
