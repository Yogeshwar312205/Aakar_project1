# Change Password Feature

## Overview
Implemented a secure password change feature that allows employees to update their passwords. The feature includes current password verification, validation, and secure password hashing.

## Features

✅ **Current Password Verification** - Must enter correct current password
✅ **Password Strength Validation** - Minimum 6 characters required
✅ **Password Confirmation** - Must match confirmation field
✅ **Secure Hashing** - Uses bcrypt for password encryption
✅ **Show/Hide Password** - Toggle visibility for all password fields
✅ **Account Status Check** - Blocks password change for deactivated accounts
✅ **Real-time Validation** - Instant feedback on password mismatch

## How to Use

### For Employees:

1. **Navigate to Profile**
   - Click on your profile icon or name
   - Or go to the Profile menu

2. **Click "Change Password" Button**
   - Located in the top-right corner of the Profile page
   - Blue button with lock icon

3. **Fill in the Form**:
   - **Current Password**: Your existing password
   - **New Password**: Your desired new password (min 6 characters)
   - **Confirm New Password**: Re-enter the new password

4. **Submit**
   - Click "Change Password"
   - Success message will appear
   - Modal will close automatically

### Password Requirements:

- Minimum 6 characters
- Must be different from current password
- Must match confirmation field
- Cannot be empty

## Technical Implementation

### Backend

**Endpoint**: `PUT /api/v1/employee/:employeeId/change-password`

**Authentication**: Required (cookie-based)

**Request Body**:
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Validation**:
1. Checks if current password and new password are provided
2. Validates new password length (≥6 characters)
3. Verifies current password matches database
4. Checks if account is deactivated
5. Hashes new password with bcrypt
6. Updates database

**Responses**:
- `200`: Password changed successfully
- `400`: Missing fields or password too short
- `401`: Current password incorrect
- `403`: Account deactivated
- `404`: Employee not found
- `500`: Server error

**Security Features**:
- Current password must be verified before change
- Passwords are hashed using bcrypt (salt rounds: 10)
- Protected by authentication middleware
- Logs all password change attempts

### Frontend

**Component**: `ChangePassword.jsx`

**Features**:
- Material-UI dialog with clean, professional design
- Show/Hide toggle for all password fields
- Real-time validation feedback
- Loading state during submission
- Auto-clear form on close

**Location**: Profile page (top-right button)

**State Management**:
- Local component state (no Redux needed)
- Uses authenticated user ID from Redux
- Makes direct API call with axios

## Files Modified/Created

### Backend
1. **`backend/controllers/employee.controller.js`**
   - Added `changePassword` function
   - Includes password verification and hashing

2. **`backend/routes/employee.route.js`**
   - Added route: `PUT /:employeeId/change-password`
   - Protected with authMiddleware

### Frontend
1. **`frontend/src/components/ChangePassword/ChangePassword.jsx`** *(NEW)*
   - Complete password change modal component
   - Form validation and submission logic

2. **`frontend/src/pages/Profile.jsx`**
   - Added "Change Password" button
   - Integrated ChangePassword modal

## Security Considerations

### ✅ Implemented
- Current password verification (prevents unauthorized changes)
- Bcrypt hashing (industry-standard encryption)
- Authentication required (must be logged in)
- Password length requirement (minimum 6 chars)
- Account status check (deactivated users blocked)
- Password visibility toggle (prevents shoulder surfing)

### Best Practices Followed
- Never log passwords in plain text
- Clear sensitive data from state on unmount
- Use HTTPS in production (configured separately)
- Rate limiting should be added (future enhancement)

## Testing

### Test Case 1: Successful Password Change
1. Log in as any active employee
2. Go to Profile
3. Click "Change Password"
4. Enter correct current password
5. Enter new password (min 6 chars)
6. Confirm new password
7. Click "Change Password"
8. **Expected**: Success message, modal closes
9. Log out and log back in with new password
10. **Expected**: Login successful

### Test Case 2: Wrong Current Password
1. Open Change Password modal
2. Enter wrong current password
3. Enter new password
4. Click "Change Password"
5. **Expected**: Error "Current password is incorrect"

### Test Case 3: Password Too Short
1. Open Change Password modal
2. Enter correct current password
3. Enter new password with < 6 characters
4. **Expected**: Error "New password must be at least 6 characters long"

### Test Case 4: Passwords Don't Match
1. Open Change Password modal
2. Enter different values in "New Password" and "Confirm"
3. **Expected**: Red error text "Passwords do not match"
4. Submit button should still work but will fail frontend validation

### Test Case 5: Same as Current Password
1. Open Change Password modal
2. Enter current password
3. Use same password as new password
4. **Expected**: Error "New password must be different from current password"

### Test Case 6: Deactivated Account
1. Deactivate an employee (set employeeEndDate)
2. Try to change password for that account
3. **Expected**: Error "Account has been deactivated"

## API Examples

### Using cURL:
```bash
curl -X PUT http://localhost:3000/api/v1/employee/289/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "currentPassword": "oldpass123",
    "newPassword": "newpass456"
  }'
```

### Using Postman:
1. Method: PUT
2. URL: `http://localhost:3000/api/v1/employee/289/change-password`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```
5. Cookies: Include authentication cookie

## Backend Logs

When password is changed successfully:
```
=== CHANGE PASSWORD REQUEST ===
Employee ID: 289
✅ Current password verified
✅ New password hashed
✅ Password updated successfully
```

When current password is wrong:
```
=== CHANGE PASSWORD REQUEST ===
Employee ID: 289
❌ Current password incorrect
```

## Future Enhancements

Potential improvements for production:

1. **Password Strength Indicator**
   - Visual indicator (weak/medium/strong)
   - Requirements checklist (uppercase, numbers, special chars)

2. **Password History**
   - Prevent reusing last N passwords
   - Store password hashes with timestamps

3. **Email Notification**
   - Send confirmation email when password changed
   - Include timestamp and IP address

4. **Rate Limiting**
   - Limit failed attempts (e.g., 5 attempts per 15 minutes)
   - Temporary account lock after too many failures

5. **Password Expiry**
   - Force password change every N days
   - Notify user before expiry

6. **Two-Factor Authentication**
   - Optional 2FA setup
   - Require 2FA for sensitive actions

7. **Password Reset via Email**
   - "Forgot Password" link on login page
   - Email-based password reset flow

## Troubleshooting

### Issue: "Current password is incorrect"
**Solution**: Make sure you're entering your actual current password, not the new one you want to set.

### Issue: Can't find "Change Password" button
**Solution**: Go to your Profile page. Button is in the top-right corner with a lock icon.

### Issue: Password changed but can't log in
**Solution**: 
1. Wait 10 seconds for session to sync
2. Clear browser cache
3. Try logging in again with the NEW password

### Issue: Modal doesn't close after success
**Solution**: Refresh the page. This is a rare UI glitch.

## Summary

The Change Password feature provides a secure, user-friendly way for employees to update their passwords without administrator intervention. It follows security best practices and integrates seamlessly with the existing authentication system.

**Key Benefits**:
- Self-service (no admin needed)
- Secure (current password verification)
- User-friendly (clean UI, real-time validation)
- Compliant (follows security standards)
