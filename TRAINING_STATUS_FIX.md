# Training Status Bug Fix

## Issue
Trainings were showing "Completed" status immediately after creation, even when the end date was in the future (e.g., end date: 08-10-2026).

## Root Cause
**String comparison instead of Date comparison**

The date comparison logic was comparing dates as strings in DD-MM-YYYY format:
```javascript
// WRONG - String comparison
const today = "24-09-2026";
const endDate = "08-10-2026";
if (today > endDate) // TRUE (INCORRECT!)
```

When comparing "24-09-2026" > "08-10-2026" as strings:
- Compares character by character: "2" > "0" = TRUE
- This gives the wrong result because it's lexicographical, not chronological

## Solution
Convert strings to proper Date objects using dayjs before comparison:

```javascript
// CORRECT - Date comparison
const today = dayjs();
const end = dayjs(endDate, "DD-MM-YYYY");
if (today.isAfter(end, 'day')) // FALSE (CORRECT!)
```

## Files Fixed

### 1. `/frontend/src/pages/Manager/AllTraining.jsx`
- Fixed `getTrainingStatus()` function (returns JSX with styling)
- Fixed `getTrainingStatusLabel()` function (returns string)

### 2. `/frontend/src/pages/Trainer/TrainerSwitch.jsx`
- Fixed `getTrainingStatus()` function (returns JSX with styling)
- Fixed `getTrainingStatusLabel()` function (returns string)

## Changes Applied

**Before:**
```javascript
const getTrainingStatusLabel = (startDate, endDate) => {
  const start = dayjs(startDate).format("DD-MM-YYYY");
  const end = dayjs(endDate).format("DD-MM-YYYY");
  const today = dayjs(new Date()).format("DD-MM-YYYY");

  if (today >= start && today <= end) {
    return "Ongoing"
  } else if (today > end) {
    return "Completed"
  } else {
    return "Upcoming"
  }
};
```

**After:**
```javascript
const getTrainingStatusLabel = (startDate, endDate) => {
  const start = dayjs(startDate, "DD-MM-YYYY");
  const end = dayjs(endDate, "DD-MM-YYYY");
  const today = dayjs();

  if (today.isBefore(start, 'day')) {
    return "Upcoming";
  } else if (today.isAfter(end, 'day')) {
    return "Completed";
  } else {
    return "Ongoing";
  }
};
```

## Status Logic
- **Upcoming**: Current date is BEFORE start date
- **Ongoing**: Current date is BETWEEN start and end date (inclusive)
- **Completed**: Current date is AFTER end date

## Testing
Create a new training with:
- Start Date: 30-09-2026 (future)
- End Date: 08-10-2026 (future)

**Expected Result**: Status should show "Upcoming" (if today < 30-09-2026) or "Ongoing" (if 30-09-2026 <= today <= 08-10-2026)

**Previous Bug**: Would incorrectly show "Completed"

## Additional Notes
- The backend `myTraining.controller.js` already has correct date comparison using MySQL's `CURDATE()` function
- This was purely a frontend display issue in the training list views
- The bug affected both Manager and Trainer views
