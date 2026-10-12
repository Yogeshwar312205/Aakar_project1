# Authentication Fix - Testing Guide

## 🎯 Summary of Changes

### Files Modified:
1. **frontend/src/utils/axiosInterceptor.js**
   - Fixed infinite loop risk by excluding `/refreshToken` endpoint from retry logic
   - Removed unnecessary localStorage token update (HTTP-only cookies are source of truth)
   - Added better logging for debugging

2. **frontend/src/hooks/useSessionValidator.js** (NEW)
   - Created proactive session validation hook
   - Validates tokens on app initialization before protected routes render

3. **frontend/src/App.jsx**
   - Integrated useSessionValidator hook
   - Added loading state during session validation

---

## ✅ Testing Checklist

### **Test #4: Expired Access Token Auto-Refresh Flow**

**Objective:** Verify that when access token expires (after 8 hours), the system automatically refreshes it without user intervention.

**Steps:**
1. Login to the application
2. Open Browser DevTools → Application → Cookies → `http://localhost:3000`
3. Note the `accessToken` cookie value
4. **Simulate expired access token:**
   - Option A: Wait 8+ hours (not practical)
   - Option B: Manually delete the `accessToken` cookie to simulate expiration
5. Make any API request (navigate to a protected page like "All Projects" or "My Training")
6. Open Browser Console (F12 → Console)

**Expected Results:**
- ✅ Console shows: `✅ Access token refreshed successfully`
- ✅ New `accessToken` cookie appears in DevTools
- ✅ Protected page loads successfully
- ✅ No `401 Unauthorized` errors in Console or Network tab
- ✅ User stays logged in

**Actual Result:** ____________________________________________

---

### **Test #5: Expired Refresh Token Logout Flow**

**Objective:** Verify that when BOTH access and refresh tokens expire, user is logged out gracefully.

**Steps:**
1. Login to the application
2. Open Browser DevTools → Application → Cookies → `http://localhost:3000`
3. Delete BOTH `accessToken` AND `refreshToken` cookies
4. Refresh the page (F5) or navigate to any protected route
5. Open Browser Console (F12 → Console)

**Expected Results:**
- ✅ Console shows: `❌ Token refresh failed: 401` (or similar)
- ✅ Toast notification appears: "Session expired. Please login again."
- ✅ User is automatically redirected to `/login` page
- ✅ Redux state is cleared (`isAuthenticated: false`)
- ✅ `localStorage.authData` is removed
- ✅ Backend database: `employeeRefreshToken` is set to NULL

**Actual Result:** ____________________________________________

---

### **Test #6: Page Reload with Valid Session**

**Objective:** Verify that reloading the page with valid tokens doesn't cause errors.

**Steps:**
1. Login to the application
2. Navigate to a protected page (e.g., "My Training", "All Projects")
3. Wait for data to load successfully
4. Press F5 to refresh the page
5. Observe Console and Network tab

**Expected Results:**
- ✅ Console shows: `🔐 Validating session for user: [employeeId]`
- ✅ Console shows: `✅ Session validated successfully`
- ✅ Loading indicator appears briefly ("Validating session...")
- ✅ Page loads without errors
- ✅ All protected data loads successfully
- ✅ No duplicate API requests
- ✅ User stays logged in

**Actual Result:** ____________________________________________

---

### **Test #7: Concurrent 401 Errors (Race Condition)**

**Objective:** Verify that when multiple API requests fail simultaneously with 401, only ONE refresh request is made.

**Steps:**
1. Login to the application
2. Navigate to a page that makes multiple API calls (e.g., Dashboard with projects, employees, trainings)
3. Open Browser DevTools → Network tab
4. Delete the `accessToken` cookie (simulate expired token)
5. Refresh the page (F5)
6. Observe the Network tab

**Expected Results:**
- ✅ Multiple API requests fail with `401 Unauthorized`
- ✅ Console shows: `✅ Access token refreshed successfully` (only ONCE)
- ✅ Network tab shows only ONE request to `/api/v1/employee/refreshToken`
- ✅ After refresh succeeds, all failed requests are retried automatically
- ✅ All data loads successfully
- ✅ No infinite loops or multiple refresh attempts

**Actual Result:** ____________________________________________

---

## 🔍 Additional Verification

### **Console Logging to Look For:**

✅ **Normal Flow (Valid Token):**
```
ℹ️ No authenticated session to validate
```
OR
```
🔐 Validating session for user: 290
✅ Session validated successfully
```

✅ **Expired Access Token (Refresh Success):**
```
🔐 Validating session for user: 290
✅ Access token refreshed successfully
✅ Session validated successfully
```

✅ **Expired Refresh Token (Logout):**
```
🔐 Validating session for user: 290
❌ Token refresh failed: 401
⚠️ Session validation failed, interceptor handling logout
```

---

## 🐛 Common Issues to Check

### Issue: "Cannot read property 'url' of undefined"
**Cause:** `originalRequest.url` might be undefined in some axios configurations
**Fix:** Change line 60 in `axiosInterceptor.js`:
```javascript
!originalRequest.url?.includes('/refreshToken')
```
To:
```javascript
!(originalRequest.url || '').includes('/refreshToken')
```

### Issue: Infinite redirect loop to login
**Cause:** Session validator runs on login page too
**Fix:** Already handled - validator only runs if `isAuthenticated && user?.employeeId` exist

### Issue: "Session expired" appears immediately on login
**Cause:** Cookies not being set properly
**Check:** 
1. Backend `cookieOptions` in `employee.controller.js` line 227-231
2. Ensure `secure: true` with HTTPS or use `secure: false` for localhost
3. Ensure `sameSite: "None"` with HTTPS or use `sameSite: "Lax"` for localhost

---

## 📝 Test Results Summary

| Test # | Description | Status | Notes |
|--------|-------------|--------|-------|
| 4 | Expired Access Token Auto-Refresh | ⬜ Not Tested | |
| 5 | Expired Refresh Token Logout | ⬜ Not Tested | |
| 6 | Page Reload with Valid Session | ⬜ Not Tested | |
| 7 | Concurrent 401 Errors | ⬜ Not Tested | |

**Fill in Status:** ✅ Pass | ❌ Fail | ⚠️ Partial

---

## 🚀 Next Steps After Testing

1. **If ALL tests pass:** Authentication fix is complete ✅
2. **If Test #4 fails:** Check backend refresh endpoint and cookie configuration
3. **If Test #5 fails:** Verify logout logic in interceptor and authSlice
4. **If Test #6 fails:** Check session validator hook logic
5. **If Test #7 fails:** Verify queue system in interceptor (lines 11-21)

---

## 📞 Support

If you encounter issues:
1. Check Browser Console for error messages
2. Check Network tab for failed requests
3. Share the exact error message and test number that failed
4. Provide screenshots of Console and Network tab if possible
