# SELECTEDSTAGEID REFRESH FIX

**Date:** July 21, 2026  
**Issue:** 404 error when refreshing substages after save  
**Error:** `GET http://localhost:3000/api/activeSubStages/temp-stage-1784660357648 404`

---

## 🔴 PROBLEM

**After saving substages successfully:**
1. Code tries to refresh substages for the selected stage
2. Uses: `dispatch(getActiveSubStagesByStageId(selectedStageId))`
3. But `selectedStageId` still contains tempId: `temp-stage-1784660357648`
4. Backend receives request with tempId → 404 Not Found
5. Error thrown, "Failed to update project" shown

**Why It Happened:**
- User selected a newly added stage (has tempId)
- User added substages to this new stage
- Stages saved → Get real IDs
- Substages saved successfully with mapped real IDs ✅
- Code tries to refresh: `getActiveSubStagesByStageId(selectedStageId)`
- But `selectedStageId` was never updated with the real ID! ❌

---

## ✅ SOLUTION

### Map selectedStageId Before Refresh

**Before Refresh:**
1. Check if `selectedStageId` is a tempId
2. If yes, look up the real stageId from `stageIdMapping`
3. Use the real stageId for refresh
4. If no mapping found (shouldn't happen), skip refresh

**Code:**
```javascript
if (selectedStageId) {
  // Map tempId to real ID if needed
  let realSelectedStageId = selectedStageId
  const selectedIdStr = String(selectedStageId)
  
  if ((selectedIdStr.startsWith('temp-') || selectedIdStr.startsWith('temp_'))) {
    if (stageIdMapping[selectedStageId]) {
      realSelectedStageId = stageIdMapping[selectedStageId]
      console.log(`Using real stageId ${realSelectedStageId} for refresh`)
    }
  }
  
  // Only refresh if we have a valid real stageId
  const realIdStr = String(realSelectedStageId)
  if (!realIdStr.startsWith('temp-') && !realIdStr.startsWith('temp_')) {
    await dispatch(getActiveSubStagesByStageId(realSelectedStageId)).unwrap()
  } else {
    console.log(`Skipping refresh for tempId - will refresh on next load`)
  }
}
```

---

## 🔧 IMPLEMENTATION

### File Modified:
`frontend/src/components/Project/UpdateProject/UpdateProject.jsx`

### Location:
After substages are saved (~line 370-380)

### Changes:
1. Check if `selectedStageId` is a tempId
2. Map to real stageId using `stageIdMapping`
3. Only call refresh API if we have a real stageId
4. Skip refresh if still a tempId (edge case protection)

---

## 🧪 TESTING

### Test: Add Stage + Substage + Refresh
**Steps:**
1. Hard refresh: Ctrl+Shift+R
2. Add new stage (gets tempId: temp-stage-123)
3. Select the new stage
4. Add substage to it
5. Click Save

**Expected Console:**
```
✅ Mapped tempId temp-stage-123 to real stageId 154
✅ Replacing substage's tempId temp-stage-123 with real stageId 154
Using mapped real stageId 154 for refresh instead of temp-stage-123
Changes saved successfully!
```

**Expected Network:**
```
POST /api/stages → 201 (Stage created, ID: 154)
POST /api/subStages → 201 (Substage created with stageId: 154)
GET /api/activeSubStages/154 → 200 (Refresh with real ID ✅)
```

**Before Fix:**
```
POST /api/stages → 201 (Stage created, ID: 154)
POST /api/subStages → 201 (Substage created with stageId: 154)
GET /api/activeSubStages/temp-stage-123 → 404 ❌
Error: Failed to update project
```

**After Fix:**
```
POST /api/stages → 201 (Stage created, ID: 154)
POST /api/subStages → 201 (Substage created with stageId: 154)
GET /api/activeSubStages/154 → 200 ✅
Success: Project updated successfully!
```

---

## 📊 FLOW DIAGRAM

### Before Fix:
```
1. Add Stage → tempId: temp-123
2. Select Stage (selectedStageId = temp-123)
3. Add Substages
4. Save:
   - Save Stage → Real ID: 154
   - Save Substages → stageId: 154 ✅
   - Refresh: GET /api/activeSubStages/temp-123 ❌
   - 404 Error!
```

### After Fix:
```
1. Add Stage → tempId: temp-123
2. Select Stage (selectedStageId = temp-123)
3. Add Substages
4. Save:
   - Save Stage → Real ID: 154
   - Map: temp-123 → 154
   - Save Substages → stageId: 154 ✅
   - Check selectedStageId: temp-123 → Map to 154
   - Refresh: GET /api/activeSubStages/154 ✅
   - Success!
```

---

## 🎯 KEY POINTS

1. **selectedStageId is UI state** - Not automatically updated when stage gets real ID
2. **Must map selectedStageId** - Just like we map substage.stageId
3. **Skip if no mapping** - Graceful degradation (refresh on next page load)
4. **Console logging** - Helps debug mapping issues

---

## ⚠️ EDGE CASES

### Case 1: No selectedStageId
**Scenario:** User didn't select a stage before saving  
**Result:** Skip refresh (no stage selected)  
**Handled:** ✅ `if (selectedStageId)` check

### Case 2: selectedStageId is already real ID
**Scenario:** User selected existing stage, not new one  
**Result:** Use as-is, no mapping needed  
**Handled:** ✅ Only map if starts with `temp-` or `temp_`

### Case 3: Mapping not found
**Scenario:** Somehow tempId has no mapping (shouldn't happen)  
**Result:** Skip refresh, log warning  
**Handled:** ✅ Check if still tempId after mapping attempt

---

## 🔗 RELATED FIXES

This fix completes the trilogy:
1. **First Fix:** Map substage.stageId from tempId to real ID
2. **Second Fix:** Handle both `temp-` and `temp_` formats
3. **Third Fix (This):** Map selectedStageId for refresh call

All three work together to enable adding stages + substages in one operation!

---

**Fix Applied By:** Kiro AI Assistant  
**Date:** July 21, 2026  
**Status:** ✅ COMPLETE  
**Location:** `UpdateProject.jsx` line ~375
