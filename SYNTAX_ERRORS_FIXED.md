# Syntax Errors Fixed

## Issue 1: Backend - Extra closing brace in substage.controller.js

**Error:**
```
SyntaxError: Unexpected token '}'
at line 1005
```

**Root Cause:**
Extra closing brace `})` at line 1005 in the `toggleSubStageCompletion` function.

**Fix:**
Removed the extra closing brace. The function now has correct brace matching.

**File:** `backend/controllers/substage.controller.js`

---

## Issue 2: Frontend - Duplicate variable declaration

**Error:**
```
Identifier 'canComplete' has already been declared. (82:8)
```

**Root Cause:**
Variable `canComplete` was declared twice:
1. Line 79: `const canComplete = !hasChildren || areAllChildrenCompleted(node)`
2. Line 82: `const canComplete = canMarkSubstageComplete(node)`

**Fix:**
Removed the first declaration (line 79) which was leftover code from before implementing `canMarkSubstageComplete`. The second declaration is the correct one that uses RBAC permission checking.

**File:** `frontend/src/components/common/SubstageTreeNode/SubstageTreeNode.jsx`

---

## Validation

✅ **Backend:** `substage.controller.js` - 0 diagnostics errors  
✅ **Frontend:** `SubstageTreeNode.jsx` - 0 diagnostics errors

---

## Status

Both files are now fixed and should compile without errors.

**Next Steps:**
1. Restart backend server: `npm run dev` in backend directory
2. Restart frontend dev server: `npm run dev` in frontend directory
3. Verify no compilation errors
4. Test RBAC functionality

---

**Fixed:** $(date)
