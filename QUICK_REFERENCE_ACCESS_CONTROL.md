# Quick Reference: HR Access Control

**Last Updated:** July 18, 2026

---

## Access String Format

```
[HR],[Project],[Training],[Ticket]
[13],[13],[25],[10]
```

**Example:**
```
0000000000000,1111111111111,0000000000000000000000000,0000000000
```

---

## Project Management (Group 1)

### Structure (13 characters)

```
Position:  0   1234   5678   9 10 11 12
           M  [Proj]  [Stag] [Subs]
           │   ARUD   ARUD   ARUD

M = Module Enabled
A = Add
R = Read  
U = Update
D = Delete
```

### Quick Values

| Scenario | Value | What It Means |
|----------|-------|---------------|
| Full Access | `1111111111111` | All permissions for all |
| Read Only | `1010101010101` | Can only view |
| Add & Update | `1101101101101` | Can create and edit |
| Module Off | `0000000000000` | No access at all |

---

## Setting Permissions

1. HR Management → Employees → Edit
2. Toggle "Project Management" ON
3. Check boxes for desired permissions
4. Save

---

## Checking Permissions

### Console Command
```javascript
let state = window.__REDUX_DEVTOOLS_EXTENSION__.store.getState();
console.log(state.auth.user?.employeeAccess.split(',')[1]);
```

### SQL Query
```sql
SELECT employeeAccess FROM employees WHERE employeeId = ?;
```

---

## What Was Fixed

**File:** `AccessTable.jsx`  
**Issue:** Wrong string lengths (was 52, should be 13/25/10)  
**Fix:** Dynamic length calculation per module

---

## Testing Checklist

**Full Access** (`1111111111111`):
- [ ] Add Project button shows
- [ ] Project table shows
- [ ] Edit Project button shows
- [ ] Edit Stage button shows
- [ ] Edit Substage button shows
- [ ] Delete icons show

**Read Only** (`1010101010101`):
- [ ] Only view/read functionality
- [ ] No add/edit/delete buttons

---

## Common Issues

❌ **Buttons not showing**  
→ Log out and log back in

❌ **Access string wrong format**  
→ Re-edit and save employee

❌ **Changes not saving**  
→ Check browser console for errors

---

## Files Modified

- ✅ `frontend/src/pages/employee/AccessTable.jsx`

## Documentation

1. **TASK_7_HR_ACCESS_CONTROL_FIX.md** - Full details
2. **HR_ACCESS_CONTROL_FIX_SUMMARY.md** - Technical summary
3. **TEST_ACCESS_CONTROL.md** - Testing guide
4. **HR_ACCESS_CONTROL_ANALYSIS.md** - System analysis
5. **QUICK_REFERENCE_ACCESS_CONTROL.md** - This file

---

**Need Help?** Check TASK_7_HR_ACCESS_CONTROL_FIX.md for detailed troubleshooting
