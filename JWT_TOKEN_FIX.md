# JWT Token "Malformed" Error Fix

## Issue
Getting `401 (Unauthorized)` error with message `{"message":"jwt malformed"}` when trying to fetch employee projects.

## Root Cause
The JWT token stored in `localStorage` is corrupted or has extra characters (like quotes wrapping the token string).

## Solution

### Option 1: Log Out and Log Back In (Recommended)
1. Click on your profile/logout button
2. Log in again with your credentials  
3. This will generate a fresh, valid JWT token
4. Try accessing the employee profile again

### Option 2: Clear Browser Storage (If logout doesn't work)
1. Open Browser Console (F12)
2. Go to "Application" or "Storage" tab
3. Find "Local Storage" → `http://localhost:5173`
4. Delete the `token` entry
5. Refresh the page
6. Log in again

### Option 3: Manual Token Check (For debugging)
Open Browser Console and run:
```javascript
// Check current token
const token = localStorage.getItem('token');
console.log('Token:', token);
console.log('Token type:', typeof token);
console.log('Token length:', token ? token.length : 0);

// Token should be a string like: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// If it looks like: "\"eyJhbGciO...\"" (with extra quotes), it's corrupted
```

## Changes Made

### 1. Backend Route (`project.routes.js`)
Added proper access control middleware:
```javascript
router.get(
  '/projects/employee/:employeeId', 
  authMiddleware,                           // Verify JWT token
  requireProjectAccess('project', 'read'),  // Check permissions
  getProjectsByEmployeeId
)
```

### 2. Frontend (`EmployeeProfile.jsx`)
Added token debugging:
```javascript
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token ? token.length : 0);
```

## How JWT Authentication Works

1. **Login**: User logs in → Server generates JWT token → Token stored in localStorage
2. **API Request**: Frontend sends token in Authorization header: `Bearer <token>`
3. **Verification**: Backend middleware verifies token signature and expiration
4. **Response**: If valid → process request, If invalid → return 401

## Common JWT "Malformed" Causes

1. **Extra Quotes**: Token is `""eyJhbGc..."` instead of `"eyJhbGc..."`
2. **Missing Prefix**: Sending `eyJhbGc...` instead of `Bearer eyJhbGc...`
3. **Corrupted Token**: Token string is incomplete or modified
4. **Wrong Token Format**: Not a valid JWT (should have 3 parts separated by dots)
5. **Expired Token**: Token past expiration time (though this usually gives "jwt expired" error)

## Testing Steps

After logging out and back in:

1. **Check Console Logs**:
   ```
   Token exists: true
   Token length: [should be 200-500 characters]
   Fetching from URL: http://localhost:3000/api/projects/employee/3
   Response status: 200  ← Should be 200, not 401
   Received projects data: {success: true, data: [...]}
   ```

2. **Backend Console** should show:
   ```
   === getProjectsByEmployeeId called ===
   customEmployeeId: 3
   Found employeeId: [number]
   Found projects count: [number]
   ```

3. **Projects Section** should display:
   - Project table with data (if employee has projects)
   - OR "This employee is not assigned to any projects yet" (if no projects)

## Files Modified
- `backend/routes/project.routes.js` - Added requireProjectAccess middleware
- `frontend/src/pages/employee/EmployeeProfile.jsx` - Added token debugging logs

## Status
✅ **Backend Updated** - Route now uses proper authentication
✅ **Backend Running** - Server on port 3000
⏳ **User Action Required** - Log out and log back in to get fresh token

## Next Steps
1. Log out of the application
2. Log back in
3. Navigate to HR Management → Click on employee
4. Check if projects appear
5. If still issues, check console logs and share them
