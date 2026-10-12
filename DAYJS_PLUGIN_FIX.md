# Dayjs Plugin Error Fix

## Error Message
```
TypeError: today.isSameOrAfter is not a function
TypeError: today.isSameOrBefore is not a function
```

## Root Cause

The methods `isSameOrAfter()` and `isSameOrBefore()` are **NOT built-in** dayjs methods. They require plugins to be loaded.

### Built-in vs Plugin Methods

**✅ Built-in (no plugin needed):**
- `.isBefore(date)`
- `.isAfter(date)`  
- `.isSame(date)`
- `.format()`
- `.diff()`

**❌ Require Plugins:**
- `.isSameOrAfter(date)` → requires `isSameOrAfter` plugin
- `.isSameOrBefore(date)` → requires `isSameOrBefore` plugin

## The Fix

### Step 1: Import Dayjs Plugins

Added to `EmployeeSwitch.jsx`:

```javascript
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extend dayjs with required plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
```

### Why This Happened

When I fixed the training status calculation, I used `isSameOrAfter()` and `isSameOrBefore()` methods without checking if the plugins were loaded. Other components like `TrainerSwitch.jsx` and `AllTraining.jsx` already had these plugins loaded.

## Alternative Solutions

If plugins can't be loaded, we can use built-in methods:

### Option 1: Use Built-in Methods with OR Logic
```javascript
const getTrainingStatusLabel = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const today = dayjs();

  // Use built-in methods: isSame + isAfter = isSameOrAfter
  const isTodayAfterOrSameStart = today.isAfter(start, 'day') || today.isSame(start, 'day');
  const isTodayBeforeOrSameEnd = today.isBefore(end, 'day') || today.isSame(end, 'day');

  if (isTodayAfterOrSameStart && isTodayBeforeOrSameEnd) {
    return "Ongoing"
  } else if (today.isAfter(end, 'day')) {
    return "Completed"
  } else {
    return "Upcoming"
  }
};
```

### Option 2: Use .diff() Method
```javascript
const getTrainingStatusLabel = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const today = dayjs();

  const daysSinceStart = today.diff(start, 'day');
  const daysUntilEnd = end.diff(today, 'day');

  if (daysSinceStart >= 0 && daysUntilEnd >= 0) {
    return "Ongoing"
  } else if (daysUntilEnd < 0) {
    return "Completed"
  } else {
    return "Upcoming"
  }
};
```

### Option 3: Use Native JavaScript Date (no dayjs)
```javascript
const getTrainingStatusLabel = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  // Set time to midnight for date-only comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (today >= start && today <= end) {
    return "Ongoing"
  } else if (today > end) {
    return "Completed"
  } else {
    return "Upcoming"
  }
};
```

## Files Modified

### Frontend:
- `frontend/src/pages/EmployeePOV/EmployeeSwitch.jsx`
  - Added `isSameOrBefore` plugin import
  - Added `isSameOrAfter` plugin import
  - Extended dayjs with both plugins

## How to Test

### Step 1: Restart Frontend
```bash
cd frontend
npm run dev
```

### Step 2: Hard Refresh Browser
- Press `Ctrl + Shift + R`

### Step 3: Navigate to Training Status Page

### Step 4: Check Console
You should NO LONGER see:
```
❌ TypeError: today.isSameOrAfter is not a function
```

Instead, you should see:
```
🔍 Training Status Calculation: {...}
✅ Status: Ongoing
```

### Step 5: Verify Training List Shows
Trainings should now display with correct status

## Why Plugins Are Needed

Dayjs is designed to be lightweight. Core functionality is minimal, and additional features are opt-in through plugins. This keeps the base library small.

**Plugin System Benefits:**
- ✅ Smaller bundle size (only load what you need)
- ✅ Modular architecture
- ✅ Easy to extend

**Common Plugins:**
- `customParseFormat` - Parse custom date formats
- `isSameOrBefore` - Date comparison
- `isSameOrAfter` - Date comparison
- `isBetween` - Check if date is between two dates
- `utc` - UTC mode support
- `timezone` - Timezone support
- `duration` - Duration support
- `relativeTime` - Relative time (e.g., "2 hours ago")

## Other Components Already Using Plugins

### TrainerSwitch.jsx ✅
```javascript
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
```

### AllTraining.jsx ✅
```javascript
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
```

Both use `isBefore()` and `isAfter()` which are built-in, so they didn't have issues.

## Lesson Learned

When using dayjs comparison methods beyond the basic `isBefore()`, `isAfter()`, and `isSame()`:
1. **Check if plugin is needed** - Read dayjs documentation
2. **Import the plugin** - `import pluginName from 'dayjs/plugin/pluginName'`
3. **Extend dayjs** - `dayjs.extend(pluginName)`
4. **Test thoroughly** - Ensure plugins are loaded before using methods

## Documentation Reference

[Dayjs Plugin: isSameOrAfter](https://day.js.org/docs/en/plugin/is-same-or-after)  
[Dayjs Plugin: isSameOrBefore](https://day.js.org/docs/en/plugin/is-same-or-before)  
[Dayjs Plugin Guide](https://day.js.org/docs/en/plugin/plugin)

## Summary

**Fixed by importing and extending dayjs with `isSameOrAfter` and `isSameOrBefore` plugins. These methods are not built-in and require explicit plugin loading.**
