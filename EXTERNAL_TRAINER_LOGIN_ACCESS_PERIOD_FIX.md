# External Trainer - Login Access Period Validation Fix

## Issue
External trainers could still log in even after their access period (`accessEndDate`) had expired. The system only validated the access period on API requests through middleware, not during the login itself.

**Problem:** 
- External trainer access expires on 9/26/2026
- Trainer attempts login on 9/27/2026
- Login succeeds ❌ (should fail)
- API calls then get blocked by authMiddleware

## Root Cause
The `loginEmployee` function in `employee.controller.js` checked for `employeeEndDate` (account deactivation) but did not validate external trainer-specific access dates (`accessStartDate` and `accessEndDate`).

## Solution
Added access period validation in the login function for external trainers:

### Validation Logic Added
```javascript
// Check external trainer access period
if (employee.userType === 'external_trainer') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if access dates are set
    if (!employee.accessStartDate || !employee.accessEndDate) {
        return res.status(401).json({ 
            message: "Access period not configured. Please contact the administrator." 
        });
    }
    
    const startDate = new Date(employee.accessStartDate);
    const endDate = new Date(employee.accessEndDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Check if access hasn't started yet
    if (today < startDate) {
        return res.status(401).json({ 
            message: `Access period starts on ${startDate.toLocaleDateString()}. Please try again after this date.` 
        });
    }
    
    // Check if access has expired
    if (today > endDate) {
        return res.status(401).json({ 
            message: "Access period has expired. Please contact the administrator to extend access." 
        });
    }
}
```

## Validation Scenarios

### Scenario 1: Missing Access Dates
**Condition:** `accessStartDate` or `accessEndDate` is NULL  
**Action:** Block login  
**Message:** "Access period not configured. Please contact the administrator."

### Scenario 2: Access Not Started
**Condition:** Current date < `accessStartDate`  
**Action:** Block login  
**Message:** "Access period starts on [date]. Please try again after this date."  
**Example:** Login on 9/20/2026, access starts 9/23/2026

### Scenario 3: Access Expired
**Condition:** Current date > `accessEndDate`  
**Action:** Block login  
**Message:** "Access period has expired. Please contact the administrator to extend access."  
**Example:** Login on 9/27/2026, access ended 9/26/2026

### Scenario 4: Access Active
**Condition:** `accessStartDate` ≤ Current date ≤ `accessEndDate`  
**Action:** Allow login ✅  
**Example:** Login on 9/25/2026, access valid 9/23/2026 to 9/28/2026

## Date Comparison Logic
- Uses date-only comparison (strips time component with `setHours(0, 0, 0, 0)`)
- **Access end date is inclusive**: If `accessEndDate = 9/28/2026`, trainer can login on 9/28/2026
- **Expiry check**: `today > endDate` means access expired (not >=)

## Testing

### Test Access Expiry
1. **Find external trainer:**
   ```sql
   SELECT employeeId, employeeName, accessStartDate, accessEndDate 
   FROM employee 
   WHERE userType = 'external_trainer';
   ```

2. **Set access to expired:**
   ```sql
   UPDATE employee 
   SET accessEndDate = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
   WHERE employeeId = 300;
   ```

3. **Try to login:**
   - Navigate to login page
   - Enter external trainer credentials (e.g., anu@gmail.com)
   - **Expected:** Login fails with error message "Access period has expired"

4. **Restore access:**
   ```sql
   UPDATE employee 
   SET accessEndDate = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
   WHERE employeeId = 300;
   ```

### Test Access Not Started
```sql
UPDATE employee 
SET accessStartDate = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
WHERE employeeId = 300;
```
**Expected:** Login fails with "Access period starts on [future date]"

### Test Script
Run the validation test script:
```bash
cd backend
node test-external-trainer-access-validation.mjs
```

Output shows:
- Current access status (ALLOWED/BLOCKED)
- Reason for blocking (if blocked)
- Days remaining or days since expiry
- SQL commands to modify access dates

## Benefits
✅ External trainers cannot login after access expires  
✅ Clear error messages explain why login failed  
✅ Prevents unauthorized access beyond contracted period  
✅ Consistent validation at login and API level  
✅ Admins can easily extend access via database update  
✅ Future-dated access (start date in future) also blocked

## Admin Actions

### Extend Access for External Trainer
```sql
-- Extend by 30 days from today
UPDATE employee 
SET accessEndDate = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
WHERE employeeId = [trainer_id];

-- Set specific end date
UPDATE employee 
SET accessEndDate = '2027-03-31'
WHERE employeeId = [trainer_id];
```

### Check All External Trainer Access Status
```sql
SELECT 
    employeeId,
    employeeName,
    employeeEmail,
    accessStartDate,
    accessEndDate,
    CASE 
        WHEN CURDATE() < accessStartDate THEN 'Not Started'
        WHEN CURDATE() > accessEndDate THEN 'Expired'
        ELSE 'Active'
    END as accessStatus,
    DATEDIFF(accessEndDate, CURDATE()) as daysRemaining
FROM employee
WHERE userType = 'external_trainer'
ORDER BY accessEndDate;
```

## Files Modified
- **backend/controllers/employee.controller.js** - Added access period validation in `loginEmployee` function

## Related Features
- Works with authMiddleware access checks (double layer of protection)
- Compatible with External Trainer feature
- Uses same date fields as API middleware validation

## Security Notes
- Date validation happens BEFORE token generation
- No tokens are issued for expired access
- Validation uses server-side dates (not client-provided)
- Time component stripped for accurate day-based comparison

---

**Fixed:** September 24, 2026  
**Status:** Complete ✅

## Quick Reference

**Test expired access:**
```sql
UPDATE employee SET accessEndDate = DATE_SUB(CURDATE(), INTERVAL 1 DAY) WHERE employeeId = 300;
```

**Restore access:**
```sql
UPDATE employee SET accessEndDate = DATE_ADD(CURDATE(), INTERVAL 30 DAY) WHERE employeeId = 300;
```

**Check status:**
```bash
node backend/test-external-trainer-access-validation.mjs
```
