# My Training - Quick Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
- ✅ Backend server running on port 3000
- ✅ Frontend running on port 5173
- ✅ Database contains training data
- ✅ Employee enrolled in at least one training

---

## 📋 5-Minute Test

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd backend
node index.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 2: Login
- Open browser: `http://localhost:5173`
- Login as an employee (e.g., Yogendra, test_pm, or any employee)
- **Not as external trainer** (they don't have access)

### Step 3: Navigate to My Training
1. Look at left sidebar
2. Click on **"Training"** menu
3. Click on **"My Training"** (first item in submenu)

### Step 4: Verify Dashboard Loads
You should see:
- ✅ 4 statistics cards at the top
- ✅ Training cards in a grid
- ✅ Session list table at the bottom
- ✅ Attendance statistics section

### Step 5: Test Interactions
- ✅ Click filter buttons (All, Upcoming, Completed)
- ✅ Click on a training card → Should navigate to details
- ✅ Check if progress bars display correctly
- ✅ Verify attendance badges show correct colors

---

## 🔍 Detailed Test Cases

### Test Case 1: Dashboard Statistics
**Expected:**
- Total Trainings: Shows count of enrolled trainings
- Ongoing Trainings: Shows trainings in progress
- Sessions Today: Shows sessions scheduled for today
- Attendance Rate: Shows percentage (e.g., 85%)

**How to Verify:**
```sql
-- Count total trainings
SELECT COUNT(*) FROM trainingRegistration WHERE employeeId = 290;

-- Count ongoing trainings
SELECT COUNT(*) FROM training t
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
WHERE tr.employeeId = 290 
AND CURDATE() BETWEEN t.startTrainingDate AND t.endTrainingDate;

-- Count today's sessions
SELECT COUNT(*) FROM sessions s
JOIN training t ON s.trainingId = t.trainingId
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
WHERE tr.employeeId = 290 AND DATE(s.sessionDate) = CURDATE();
```

### Test Case 2: Today's Sessions Widget
**Expected:**
- Shows ONLY sessions scheduled for today
- Displays session time (10:00 AM - 12:00 PM format)
- Shows attendance status (Present/Absent/Pending)

**How to Test:**
1. Create a session for today in database:
```sql
INSERT INTO sessions (sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription, trainingId)
VALUES ('Test Session', CURDATE(), '10:00:00', '12:00:00', 'Test', 25);
```
2. Refresh page
3. Widget should appear with the session

### Test Case 3: Training Cards
**Expected:**
- Each enrolled training shows as a card
- Progress bar shows completion percentage
- Status badge (Ongoing/Completed/Not Started)
- Skills shown as badges
- Attendance percentage displayed

**How to Test:**
- Click on a training card
- Should navigate to `/EmployeeTrainingDetails`
- Shows all sessions for that training

### Test Case 4: Session List Filters
**Expected:**
- **All:** Shows all sessions
- **Upcoming:** Shows only future sessions
- **Completed:** Shows only past sessions

**How to Test:**
1. Click "All" → See all sessions
2. Click "Upcoming" → See only future sessions
3. Click "Completed" → See only past sessions
4. Count should change in heading

### Test Case 5: Attendance Statistics
**Expected:**
- Total Sessions: All sessions across all trainings
- Past Sessions: Sessions that have occurred
- Attended: Sessions marked as present
- Missed: Sessions marked as absent
- Breakdown bar shows visual percentage

**How to Verify:**
```sql
-- Check attendance data
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN attendanceStatus = 1 THEN 1 ELSE 0 END) as attended,
    SUM(CASE WHEN attendanceStatus = 0 THEN 1 ELSE 0 END) as missed
FROM attendance
WHERE employeeId = 290;
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "No trainings found"
**Cause:** Employee not enrolled in any training

**Fix:**
```sql
-- Enroll employee in a training
INSERT INTO trainingRegistration (employeeId, trainingId)
VALUES (290, 25);
```

### Issue 2: Today's Sessions widget doesn't appear
**Cause:** No sessions scheduled for today

**Fix:**
```sql
-- Create a session for today
INSERT INTO sessions (sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription, trainingId)
VALUES ('Today Session', CURDATE(), '14:00:00', '16:00:00', 'Test session', 25);
```

### Issue 3: Attendance shows as "Pending" instead of Present/Absent
**Cause:** No attendance record exists

**Fix:**
```sql
-- Mark attendance
INSERT INTO attendance (employeeId, sessionId, attendanceStatus)
VALUES (290, 1, 1);  -- 1 = Present, 0 = Absent
```

### Issue 4: Progress bar shows 0%
**Cause:** Training has no sessions OR all sessions are in future

**Fix:**
```sql
-- Add sessions to training
INSERT INTO sessions (sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription, trainingId)
VALUES 
('Session 1', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '10:00:00', '12:00:00', 'Past session', 25),
('Session 2', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '10:00:00', '12:00:00', 'Past session', 25),
('Session 3', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '12:00:00', 'Future session', 25);

-- Mark attendance for past sessions
INSERT INTO attendance (employeeId, sessionId, attendanceStatus)
VALUES (290, 1, 1), (290, 2, 1);
```

### Issue 5: Menu item "My Training" not visible
**Cause:** User is external trainer OR browser cache

**Fix:**
- Ensure logged in as internal employee
- Hard refresh: Ctrl + Shift + R
- Clear browser cache

### Issue 6: API returns 401 Unauthorized
**Cause:** Not authenticated or session expired

**Fix:**
- Logout and login again
- Check if JWT token is present in cookies
- Verify backend authMiddleware is working

### Issue 7: Loading spinner never stops
**Cause:** API call failed or taking too long

**Debug:**
- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for failed requests
- Verify backend server is running

---

## 🎯 Test Data Setup (Optional)

If you need to create test data for comprehensive testing:

```sql
-- 1. Create a test employee (if needed)
INSERT INTO employee (customEmployeeId, employeeName, employeeEmail, employeePassword, userType)
VALUES ('TEST001', 'Test Employee', 'test@example.com', '$2a$10$hashedpassword', 'internal');

-- 2. Create a test training
INSERT INTO training (trainingTitle, trainerId, startTrainingDate, endTrainingDate, evaluationType)
VALUES ('React Advanced', 290, DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 23 DAY), 'Assignments');

-- 3. Enroll employee in training
INSERT INTO trainingRegistration (employeeId, trainingId)
VALUES (LAST_INSERT_ID(), LAST_INSERT_ID());

-- 4. Add skills to training
INSERT INTO trainingSkills (trainingId, skillId)
VALUES (LAST_INSERT_ID(), 45);  -- Assuming skillId 45 exists

-- 5. Create sessions
INSERT INTO sessions (sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription, trainingId)
VALUES 
('Session 1', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '10:00:00', '12:00:00', 'Introduction', LAST_INSERT_ID()),
('Session 2', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '10:00:00', '12:00:00', 'Deep Dive', LAST_INSERT_ID()),
('Session 3', CURDATE(), '14:00:00', '16:00:00', 'Today Session', LAST_INSERT_ID()),
('Session 4', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '12:00:00', 'Future Session', LAST_INSERT_ID());

-- 6. Mark attendance for past sessions
SET @empId = (SELECT employeeId FROM employee WHERE customEmployeeId = 'TEST001');
INSERT INTO attendance (employeeId, sessionId, attendanceStatus)
VALUES 
(@empId, LAST_INSERT_ID()-3, 1),  -- Present
(@empId, LAST_INSERT_ID()-2, 0);  -- Absent
```

---

## ✅ Success Criteria

Your test is successful if:
- [x] Dashboard loads within 2 seconds
- [x] All 4 statistics cards show numbers
- [x] Training cards display with progress bars
- [x] Session list table loads
- [x] Filter buttons work
- [x] Click on training card navigates to details
- [x] Attendance badges show correct colors
- [x] No console errors
- [x] No API errors (check Network tab)
- [x] Responsive on mobile (resize browser)

---

## 📸 Expected Screenshots

### Desktop View
- Full dashboard with all sections
- Statistics cards in a row of 4
- Training cards in a grid (2-3 columns)
- Session list table below

### Mobile View
- Statistics cards stacked (1-2 columns)
- Training cards stacked (1 column)
- Session list becomes scrollable

---

## 🔄 Next Steps After Testing

1. **If all tests pass:**
   - Mark feature as production-ready
   - Deploy to staging environment
   - Conduct UAT (User Acceptance Testing)

2. **If issues found:**
   - Document issues in detail
   - Create bug tickets
   - Fix issues and re-test

3. **User Feedback:**
   - Collect feedback from employees
   - Note feature requests
   - Plan Phase 2 enhancements

---

**Happy Testing! 🎉**

*For detailed implementation info, see: `MY_TRAINING_FEATURE_IMPLEMENTATION_SUMMARY.md`*
