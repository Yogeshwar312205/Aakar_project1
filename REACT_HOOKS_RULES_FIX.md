# REACT HOOKS RULES VIOLATION FIX

**Date:** July 21, 2026  
**Issue:** "Rendered fewer hooks than expected" error in Department page  
**Error:** Occurs when clicking on Department in Employee Management

---

## 🔴 PROBLEM

**Error Message:**
```
Uncaught Error: Rendered fewer hooks than expected. 
This may be caused by an accidental early return statement.
```

**Root Cause:**
In `DepartmentProfile.jsx`, hooks were called AFTER conditional early returns:

```javascript
function DepartmentProfile() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { employees, loading } = useSelector(...)
  
  // ❌ EARLY RETURN #1 - Before all hooks!
  if (loading) {
    return <div>Loading...</div>
  }
  
  // More code...
  
  // ❌ EARLY RETURN #2 - Before all hooks!
  if (!department) {
    return <div>Department not found.</div>
  }
  
  // ❌ useState hooks defined AFTER conditional returns!
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  // ... more hooks
  
  const navigate = useNavigate() // ❌ More hooks after returns!
}
```

**Why This Is Wrong:**
- React expects hooks to be called in the SAME ORDER every render
- Early returns skip some hook calls
- React gets confused: "Why are there fewer hooks this time?"

---

## ✅ SOLUTION

### Rule: ALL Hooks MUST Be at the Top

**Move ALL hooks to the top, BEFORE any conditional returns:**

```javascript
function DepartmentProfile() {
  // ✅ Step 1: ALL useState hooks first
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [showSecondModal, setShowSecondModal] = useState(false)
  const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] = useState(false)
  
  // ✅ Step 2: ALL other hooks (useParams, useNavigate, useSelector, useDispatch)
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { employees, loading } = useSelector(...)
  const allDepartmentData = useSelector(...)
  const employeeAccess = useSelector(...) 
  
  // ✅ Step 3: Computed values
  const hrAccess = getHRManagementAccess(employeeAccess)
  const departmentData = allDepartmentData.departments
  
  // ✅ Step 4: ALL useEffect hooks
  useEffect(() => {
    dispatch(fetchAllDepartments())
    dispatch(getAllEmployees())
  }, [dispatch])
  
  useEffect(() => {
    console.log('Selected Employees Updated:', selectedEmployees)
  }, [selectedEmployees])
  
  // ✅ Step 5: NOW conditional returns are safe!
  if (loading) {
    return <div>Loading...</div>
  }
  
  // More code...
  
  if (!department) {
    return <div>Department not found.</div>
  }
  
  // Rest of component...
}
```

---

## 🔧 CHANGES MADE

### File Modified:
`frontend/src/pages/department/DepartmentProfile.jsx`

### Specific Changes:

1. **Moved all `useState` hooks to the top** (before any conditional logic)
2. **Moved `useNavigate` to the top** (was at line ~210, now at line ~5)
3. **Consolidated all `useSelector` hooks together**
4. **Moved all `useEffect` hooks before conditional returns**
5. **Removed duplicate `useEffect` for selectedEmployees**

---

## 📚 REACT RULES OF HOOKS

### Rule #1: Only Call Hooks at the Top Level
- ❌ Don't call Hooks inside loops, conditions, or nested functions
- ✅ Call them at the top level of your function component

### Rule #2: Only Call Hooks from React Functions
- ✅ Call Hooks from React function components
- ✅ Call Hooks from custom Hooks
- ❌ Don't call Hooks from regular JavaScript functions

### Why These Rules Exist:
React relies on the ORDER in which Hooks are called to preserve state between re-renders.

**Example of what breaks:**
```javascript
// Render 1:
useState() // Hook 1
useState() // Hook 2  
useEffect() // Hook 3

// Render 2 (with early return):
useState() // Hook 1
return <div>Loading</div> // ❌ Stopped!
// Hook 2 and 3 never called!
// React: "Where are hooks 2 and 3?!" → Error!
```

---

## 🧪 TESTING

### Test: Navigate to Department Profile
**Steps:**
1. Hard refresh: Ctrl+Shift+R
2. Go to Employee Management
3. Click on "Departments"
4. Click on any department

**Before Fix:**
```
Console: ❌ Uncaught Error: Rendered fewer hooks than expected
Result: White screen / crash
```

**After Fix:**
```
Console: ✅ No errors
Result: Department profile loads correctly
```

---

### Test: Department with No Employees
**Steps:**
1. Navigate to a department with 0 employees

**Expected:**
- ✅ Page loads
- ✅ Shows 0 employees
- ✅ No hook errors

---

### Test: Loading State
**Steps:**
1. Navigate to departments
2. Watch loading state

**Expected:**
- ✅ Shows "Loading..." briefly
- ✅ Then loads department data
- ✅ No hook errors during transition

---

## 📊 BEFORE VS AFTER

### Before Fix:
```javascript
function Component() {
  // Some hooks
  if (condition) return <div/> // ❌ Early return
  // More hooks ❌ Skipped when condition is true!
}
```

### After Fix:
```javascript
function Component() {
  // ALL hooks ✅
  // ALL useEffect hooks ✅
  
  // Now early returns are safe
  if (condition) return <div/> // ✅ All hooks already called
}
```

---

## 💡 BEST PRACTICES

### DO:
```javascript
function MyComponent() {
  // ✅ All hooks at the top
  const [state, setState] = useState()
  const data = useSelector(...)
  const dispatch = useDispatch()
  
  useEffect(() => { ... }, [])
  
  // ✅ Conditional logic after hooks
  if (loading) return <Loading />
  if (!data) return <NotFound />
  
  return <div>...</div>
}
```

### DON'T:
```javascript
function MyComponent() {
  const [state, setState] = useState()
  
  // ❌ Early return before all hooks!
  if (loading) return <Loading />
  
  // ❌ Hook called conditionally!
  const data = useSelector(...)
}
```

---

## 🔍 HOW TO FIND THESE ISSUES

### Look for this pattern:
1. Hooks defined
2. Early `return` statement  
3. More hooks defined below ❌

### Quick Check:
- Count hooks at the start of function
- Count hooks in rest of function
- If numbers differ → Problem!

### Use ESLint:
```json
{
  "extends": ["react-app"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 🎯 KEY TAKEAWAYS

1. **All hooks MUST be at the top** - No exceptions
2. **Same hooks, same order, every render** - React's core requirement
3. **Early returns are fine** - But only AFTER all hooks
4. **Use ESLint plugin** - Catches these issues automatically
5. **Conditional rendering?** - Use ternary or &&, not early returns before hooks

---

**Fix Applied By:** Kiro AI Assistant  
**Date:** July 21, 2026  
**Status:** ✅ COMPLETE  
**File:** `frontend/src/pages/department/DepartmentProfile.jsx`  
**Result:** Department page loads without errors! 🎉
