# QUICK TEST GUIDE - Activity History Performance Fix

**Date:** July 21, 2026  
**Issue:** You're seeing project API calls, not activity API calls

---

## 🔍 WHAT YOU'RE SEEING NOW

The console logs showing:
```
projectSlice.js:102 {data: {...}, status: 200, ...}
```

These are **PROJECT** API calls, not **ACTIVITY** API calls. This is a different issue!

---

## 📊 TWO SEPARATE ISSUES

### Issue 1: Project API Auto-Refresh (What you're seeing)
- **Location:** Main project page (`MyProject.jsx`)
- **Cause:** Auto-refresh every 5 seconds
- **Calls:** `/api/projects/{pNo}` repeatedly
- **Status:** ✅ **JUST FIXED** - Changed to 30 seconds

### Issue 2: Activity History Performance (What we optimized)
- **Location:** Activity/SubPart component tab
- **Cause:** Individual API calls for each substage
- **Calls:** `/api/v1/activity/activeActivities/{id}` for each substage
- **Status:** ✅ **ALREADY FIXED** - Batch loading implemented

---

## 🎯 HOW TO TEST THE ACTIVITY FIX

### Step 1: Navigate to Activity History
You need to go to the **specific page/tab** where activities are displayed:

**Option A:** Direct Route
- Navigate to: `/SubPartComponent` in your browser

**Option B:** Through Project Management
- Go to Project Management
- Open a project
- Look for an "Activities" or "SubPart" or "Activity Table" tab/section
- Click on it

### Step 2: Check Network Tab
Once in the Activity section:

**✅ What you SHOULD see:**
- ONE call to: `/api/v1/activity/batch-substage-activities`
- Request body: `{substageIds: [1, 2, 3, 4, ...]}`
- Console: `"📦 Batch fetching activities for X substages"`

**❌ What you should NOT see:**
- Multiple calls to: `/api/v1/activity/activeActivities/1`
- Multiple calls to: `/api/v1/activity/activeActivities/2`
- etc.

---

## 🔧 FIXES APPLIED

### Fix 1: Reduced Project Auto-Refresh ✅
**File:** `MyProject.jsx`  
**Change:** 5 seconds → 30 seconds interval  
**Effect:** 83% fewer project API calls

### Fix 2: Activity Batch Loading ✅
**Files:** `activitiesSlice.js`, `SubPartComponent.jsx`  
**Change:** Individual calls → Single batch call  
**Effect:** 90% fewer activity API calls

---

## 📝 WHAT TO DO NOW

### 1. Hard Refresh Browser
```
Ctrl + Shift + R
```

### 2. Check Current Page Calls
- Open DevTools (F12)
- Go to Network tab
- Clear network log
- Wait 30 seconds
- You should now see project calls every 30 seconds (not 5)

### 3. Navigate to Activity Section
- Find the Activity/SubPart component page
- Watch Network tab for batch call
- Check Console for batch logs

---

## 🎯 EXPECTED RESULTS

### On Main Project Page (MyProject):
**Before:**
- Project API call every 5 seconds = 12 calls/minute
- Console spam with project data

**After (Now):**
- Project API call every 30 seconds = 2 calls/minute
- 83% reduction in calls

### On Activity History Page (SubPartComponent):
**Before:**
- 10+ individual activity API calls per load
- Page freeze during loading
- No caching

**After (Now):**
- 1 batch activity API call per load
- Smooth loading
- 5-minute cache

---

## 🐛 IF STILL SEEING RAPID CALLS

### Check 1: Which API endpoint?
```javascript
// Project calls (Main page - now 30 sec interval):
/api/projects/{projectNumber}

// Activity calls (Activity page - now batched):
/api/v1/activity/batch-substage-activities
```

### Check 2: Which page are you on?
- Main project overview → Project calls (30 sec interval) ✅
- Activity/SubPart page → Activity batch calls ✅

### Check 3: Hard refreshed?
- Close and reopen browser
- Or: Ctrl + Shift + R

---

## 📍 WHERE TO FIND ACTIVITY HISTORY

The activity history fix only applies when you're on the **Activity component page**. Check:

1. **URL route:** `/SubPartComponent`
2. **Component:** `SubPartComponent.jsx`
3. **Tab name:** Might be "Activities", "SubParts", or "Activity Table"

**If you're on the main project page (`MyProject.jsx`):**
- You'll see project API calls (now every 30 sec instead of 5)
- This is normal and expected
- This is NOT the activity history we optimized

---

## ✅ SUMMARY

**Project calls (what you're seeing):**
- ✅ Fixed: 5 sec → 30 sec interval
- Location: Main project page
- Endpoint: `/api/projects/{pNo}`

**Activity calls (what we optimized):**
- ✅ Fixed: Individual → Batch calls
- Location: Activity/SubPart page
- Endpoint: `/api/v1/activity/batch-substage-activities`

**Action needed:**
1. ✅ Hard refresh browser (Ctrl+Shift+R)
2. ✅ Navigate to Activity/SubPart section to test batch loading
3. ✅ Check Network tab for batch call vs individual calls

---

**Created:** July 21, 2026  
**Status:** Both issues fixed, testing required
