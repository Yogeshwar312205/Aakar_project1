# My Training Feature - Implementation Plan

## 📋 Feature Overview

Create a comprehensive **"My Training"** section under the Training module where employees can monitor and manage all their training activities in one centralized dashboard.

### User Goals
- View all enrolled trainings with trainer information
- Identify today's sessions requiring attendance
- Track upcoming and completed sessions
- Monitor attendance records
- View overall training progress
- Access session details, schedules, and status

---

## 🎯 Feature Requirements

### Core Functionalities

1. **Training Overview**
   - List all trainings the user is enrolled in
   - Show training title, trainer name, dates, status
   - Display training skills/topics
   - Show overall progress (completed sessions / total sessions)

2. **Today's Sessions**
   - Highlight sessions scheduled for today
   - Show session name, time, location/details
   - Display attendance status (pending/marked)
   - Quick action to view session details

3. **Session List**
   - Complete list of all sessions across all trainings
   - Filter by: Upcoming, Ongoing, Completed
   - Show session date, time, training name
   - Display attendance status for each session

4. **Attendance Tracking**
   - View attendance status per session (Present/Absent/Pending)
   - Calculate attendance percentage per training
   - Overall attendance statistics
   - Visual indicators (badges, progress bars)

5. **Training Progress**
   - Progress bar showing completed vs total sessions
   - Training status: Not Started, Ongoing, Completed
   - Session completion rate
   - Time remaining until training ends

---

## 🏗️ Technical Architecture

### Database Schema

#### Existing Tables (No changes needed)
```sql
-- training: Contains training information
-- trainingRegistration: Links employees to trainings
-- sessions: Contains session details for each training
-- attendance: Tracks employee attendance per session
-- employee: User information
-- skill: Training skills/topics
```

#### New View/Query Requirements
- Employee's enrolled trainings with aggregated data
- Today's sessions for logged-in employee
- Session list with attendance status
- Training progress calculations

---

## 📁 File Structure

### Backend Files

#### New Controllers
```
backend/controllers/
  └── myTraining.controller.js          # NEW - My Training endpoints
```

#### New Routes
```
backend/routes/
  └── myTraining.routes.js              # NEW - My Training routes
```

#### API Endpoints to Create
```
GET  /api/v1/my-training/:employeeId                    # Get all enrolled trainings
GET  /api/v1/my-training/:employeeId/today-sessions     # Get today's sessions
GET  /api/v1/my-training/:employeeId/sessions           # Get all sessions
GET  /api/v1/my-training/:employeeId/training/:trainingId/progress  # Get training progress
GET  /api/v1/my-training/:employeeId/attendance-stats   # Get attendance statistics
```

### Frontend Files

#### New Components
```
frontend/src/pages/EmployeePOV/
  ├── MyTraining/
  │   ├── MyTraining.jsx                # NEW - Main dashboard
  │   ├── MyTraining.css                # NEW - Styles
  │   ├── TrainingCard.jsx              # NEW - Individual training card
  │   ├── TodaySessionsWidget.jsx       # NEW - Today's sessions highlight
  │   ├── SessionList.jsx               # NEW - Complete session list
  │   ├── AttendanceStats.jsx           # NEW - Attendance statistics
  │   └── TrainingProgress.jsx          # NEW - Progress tracker
```

#### API Functions
```
frontend/src/pages/EmployeePOV/
  └── myTrainingAPI.js                  # NEW - API functions
```

#### Route Configuration
```javascript
// In App.jsx
<Route path="/my-training" element={<PrivateRoute><MyTraining /></PrivateRoute>} />
```

#### Sidebar Menu
```javascript
// In Sidebar.jsx - Under Training section
{
  name: 'My Training',
  slug: '/my-training',
  icon: 'FaUserGraduate',
  access: '1', // All employees
}
```

---

## 🔧 Implementation Tasks

### Phase 1: Backend Setup (Day 1-2)

#### Task 1.1: Create Backend Controller
**File:** `backend/controllers/myTraining.controller.js`

**Endpoints:**

1. **Get All Enrolled Trainings**
```javascript
// GET /api/v1/my-training/:employeeId
// Returns: List of trainings with progress and attendance stats
```

2. **Get Today's Sessions**
```javascript
// GET /api/v1/my-training/:employeeId/today-sessions
// Returns: Sessions scheduled for today with attendance status
```

3. **Get All Sessions**
```javascript
// GET /api/v1/my-training/:employeeId/sessions?filter=upcoming|completed|all
// Returns: Filtered list of sessions across all trainings
```

4. **Get Training Progress**
```javascript
// GET /api/v1/my-training/:employeeId/training/:trainingId/progress
// Returns: Detailed progress for specific training
```

5. **Get Attendance Statistics**
```javascript
// GET /api/v1/my-training/:employeeId/attendance-stats
// Returns: Overall attendance percentage and breakdown
```

#### Task 1.2: Create Routes File
**File:** `backend/routes/myTraining.routes.js`

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  getMyTrainings,
  getTodaySessions,
  getAllSessions,
  getTrainingProgress,
  getAttendanceStats
} from '../controllers/myTraining.controller.js';

const router = express.Router();

router.get('/my-training/:employeeId', authMiddleware, getMyTrainings);
router.get('/my-training/:employeeId/today-sessions', authMiddleware, getTodaySessions);
router.get('/my-training/:employeeId/sessions', authMiddleware, getAllSessions);
router.get('/my-training/:employeeId/training/:trainingId/progress', authMiddleware, getTrainingProgress);
router.get('/my-training/:employeeId/attendance-stats', authMiddleware, getAttendanceStats);

export default router;
```

#### Task 1.3: Register Routes in Main Server
**File:** `backend/index.js`

```javascript
import myTrainingRoutes from './routes/myTraining.routes.js';
app.use('/api/v1', myTrainingRoutes);
```

---

### Phase 2: Backend Queries (Day 2-3)

#### Query 1: Get Enrolled Trainings with Progress
```sql
SELECT 
    t.trainingId,
    t.trainingTitle,
    t.startTrainingDate,
    t.endTrainingDate,
    t.evaluationType,
    e.employeeName AS trainerName,
    GROUP_CONCAT(DISTINCT s.skillName) AS skills,
    COUNT(DISTINCT ses.sessionId) AS totalSessions,
    COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) AS attendedSessions,
    COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END) AS completedSessions,
    CASE 
        WHEN CURDATE() < t.startTrainingDate THEN 'Not Started'
        WHEN CURDATE() > t.endTrainingDate THEN 'Completed'
        ELSE 'Ongoing'
    END AS trainingStatus
FROM training t
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
LEFT JOIN employee e ON t.trainerId = e.employeeId
LEFT JOIN trainingSkills ts ON t.trainingId = ts.trainingId
LEFT JOIN skill s ON ts.skillId = s.skillId
LEFT JOIN sessions ses ON t.trainingId = ses.trainingId
LEFT JOIN attendance a ON ses.sessionId = a.sessionId AND a.employeeId = tr.employeeId
WHERE tr.employeeId = ?
GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, 
         t.evaluationType, e.employeeName
ORDER BY t.startTrainingDate DESC;
```

#### Query 2: Get Today's Sessions
```sql
SELECT 
    ses.sessionId,
    ses.sessionName,
    ses.sessionDate,
    ses.sessionStartTime,
    ses.sessionEndTime,
    ses.sessionDescription,
    t.trainingTitle,
    t.trainingId,
    e.employeeName AS trainerName,
    COALESCE(a.attendanceStatus, -1) AS attendanceStatus
FROM sessions ses
JOIN training t ON ses.trainingId = t.trainingId
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
LEFT JOIN employee e ON t.trainerId = e.employeeId
LEFT JOIN attendance a ON ses.sessionId = a.sessionId AND a.employeeId = tr.employeeId
WHERE tr.employeeId = ?
  AND DATE(ses.sessionDate) = CURDATE()
ORDER BY ses.sessionStartTime;
```

#### Query 3: Get All Sessions (with filter)
```sql
SELECT 
    ses.sessionId,
    ses.sessionName,
    ses.sessionDate,
    ses.sessionStartTime,
    ses.sessionEndTime,
    ses.sessionDescription,
    t.trainingTitle,
    t.trainingId,
    e.employeeName AS trainerName,
    COALESCE(a.attendanceStatus, -1) AS attendanceStatus,
    CASE 
        WHEN ses.sessionDate < CURDATE() THEN 'Completed'
        WHEN DATE(ses.sessionDate) = CURDATE() THEN 'Today'
        ELSE 'Upcoming'
    END AS sessionStatus
FROM sessions ses
JOIN training t ON ses.trainingId = t.trainingId
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
LEFT JOIN employee e ON t.trainerId = e.employeeId
LEFT JOIN attendance a ON ses.sessionId = a.sessionId AND a.employeeId = tr.employeeId
WHERE tr.employeeId = ?
  -- Dynamic filter based on query param
  AND (? = 'all' 
    OR (? = 'upcoming' AND ses.sessionDate >= CURDATE())
    OR (? = 'completed' AND ses.sessionDate < CURDATE()))
ORDER BY ses.sessionDate DESC, ses.sessionStartTime DESC;
```

#### Query 4: Get Training Progress Details
```sql
SELECT 
    t.trainingId,
    t.trainingTitle,
    t.startTrainingDate,
    t.endTrainingDate,
    COUNT(DISTINCT ses.sessionId) AS totalSessions,
    COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END) AS pastSessions,
    COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) AS attendedSessions,
    COUNT(DISTINCT CASE WHEN a.attendanceStatus = 0 THEN a.sessionId END) AS missedSessions,
    ROUND((COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) / 
           NULLIF(COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END), 0)) * 100, 2) AS attendancePercentage
FROM training t
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
LEFT JOIN sessions ses ON t.trainingId = ses.trainingId
LEFT JOIN attendance a ON ses.sessionId = a.sessionId AND a.employeeId = tr.employeeId
WHERE tr.employeeId = ? AND t.trainingId = ?
GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate;
```

#### Query 5: Get Attendance Statistics
```sql
SELECT 
    COUNT(DISTINCT t.trainingId) AS totalTrainings,
    COUNT(DISTINCT CASE WHEN CURDATE() BETWEEN t.startTrainingDate AND t.endTrainingDate THEN t.trainingId END) AS ongoingTrainings,
    COUNT(DISTINCT ses.sessionId) AS totalSessions,
    COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END) AS pastSessions,
    COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) AS attendedSessions,
    COUNT(DISTINCT CASE WHEN a.attendanceStatus = 0 THEN a.sessionId END) AS missedSessions,
    ROUND((COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) / 
           NULLIF(COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END), 0)) * 100, 2) AS overallAttendancePercentage
FROM training t
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
LEFT JOIN sessions ses ON t.trainingId = ses.trainingId
LEFT JOIN attendance a ON ses.sessionId = a.sessionId AND a.employeeId = tr.employeeId
WHERE tr.employeeId = ?;
```

---

### Phase 3: Frontend Components (Day 3-5)

#### Task 3.1: Create API Functions
**File:** `frontend/src/pages/EmployeePOV/myTrainingAPI.js`

```javascript
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

export const fetchMyTrainings = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch trainings');
    throw error;
  }
};

export const fetchTodaySessions = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/today-sessions`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch today\'s sessions');
    throw error;
  }
};

export const fetchAllSessions = async (employeeId, filter = 'all') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/sessions?filter=${filter}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch sessions');
    throw error;
  }
};

export const fetchTrainingProgress = async (employeeId, trainingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/training/${trainingId}/progress`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch training progress');
    throw error;
  }
};

export const fetchAttendanceStats = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/attendance-stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch attendance statistics');
    throw error;
  }
};
```

#### Task 3.2: Create Main Dashboard Component
**File:** `frontend/src/pages/EmployeePOV/MyTraining/MyTraining.jsx`

**Features:**
- Dashboard layout with cards
- Summary statistics at top
- Today's sessions widget
- List of enrolled trainings
- Quick filters and search
- Navigation to detailed views

#### Task 3.3: Create Sub-Components

1. **TodaySessionsWidget.jsx**
   - Displays sessions for today
   - Shows time, training name, location
   - Attendance status indicator
   - Alert if no sessions today

2. **TrainingCard.jsx**
   - Individual training information card
   - Progress bar
   - Attendance percentage
   - Quick stats (sessions completed/total)
   - Click to view details

3. **SessionList.jsx**
   - Tabular view of all sessions
   - Filters: All, Upcoming, Completed
   - Columns: Session Name, Date, Time, Training, Attendance
   - Sort by date
   - Click to view session details

4. **AttendanceStats.jsx**
   - Overall attendance percentage
   - Chart/Graph visualization
   - Breakdown by training
   - Present/Absent counts

5. **TrainingProgress.jsx**
   - Detailed progress for a training
   - Session completion timeline
   - Attendance breakdown
   - Days remaining indicator

---

### Phase 4: UI/UX Design (Day 4-5)

#### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  My Training Dashboard                              │
├─────────────────────────────────────────────────────┤
│  📊 Statistics Summary                              │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ Total    │ Ongoing  │ Sessions │ Attendance│    │
│  │ Trainings│ Trainings│ Today    │ Rate      │    │
│  └──────────┴──────────┴──────────┴──────────┘    │
├─────────────────────────────────────────────────────┤
│  🕐 Today's Sessions                                │
│  ┌───────────────────────────────────────────┐     │
│  │ Session 1 | 10:00 AM - 12:00 PM | Present │     │
│  │ Session 2 | 02:00 PM - 04:00 PM | Pending │     │
│  └───────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────┤
│  📚 My Trainings                                    │
│  ┌───────────────┬───────────────┬──────────┐      │
│  │ Training 1    │ Training 2    │ Training 3│      │
│  │ ██████░░ 75%  │ ████░░░░ 50% │ ██████░░ 80%│     │
│  │ Trainer: John │ Trainer: Jane│ Trainer: Bob│     │
│  │ 15/20 Sessions│ 10/20 Sessions│ 16/20 Sessions│  │
│  └───────────────┴───────────────┴──────────┘      │
├─────────────────────────────────────────────────────┤
│  📅 All Sessions                [Filter ▼]          │
│  ┌──────────────────────────────────────────┐      │
│  │ Session | Date | Time | Training | Status│      │
│  │─────────┼──────┼──────┼──────────┼───────│      │
│  │ Ses 1   │ 9/25 │ 10AM │ Train A  │ ✓     │      │
│  │ Ses 2   │ 9/26 │ 2PM  │ Train B  │ ✗     │      │
│  │ Ses 3   │ 9/27 │ 11AM │ Train A  │ ⏳    │      │
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

#### Color Scheme
- **Present/Attended:** Green (#4CAF50)
- **Absent/Missed:** Red (#F44336)
- **Pending:** Orange (#FF9800)
- **Upcoming:** Blue (#2196F3)
- **Completed:** Grey (#9E9E9E)

#### Icons
- Training: 📚 (FaBook)
- Session: 📅 (FaCalendar)
- Attendance: ✓ (FaCheck) / ✗ (FaTimes)
- Progress: 📊 (FaChartLine)
- Today: 🕐 (FaClock)

---

### Phase 5: Integration & Testing (Day 5-6)

#### Task 5.1: Add Sidebar Menu Item
**File:** `frontend/src/components/Sidebar.jsx`

```javascript
{
  name: 'My Training',
  slug: '/my-training',
  icon: 'FaUserGraduate',
  access: userType === 'external_trainer' ? '0' : '1',
}
```

#### Task 5.2: Add Route
**File:** `frontend/src/App.jsx`

```javascript
import MyTraining from './pages/EmployeePOV/MyTraining/MyTraining.jsx';

<Route 
  path="/my-training" 
  element={
    <PrivateRoute>
      <MyTraining />
    </PrivateRoute>
  } 
/>
```

#### Task 5.3: Testing Checklist
- [ ] Employee can view all enrolled trainings
- [ ] Today's sessions display correctly
- [ ] Attendance status shows accurately
- [ ] Progress bars calculate correctly
- [ ] Filters work (Upcoming/Completed/All)
- [ ] Search functionality works
- [ ] Click on training opens details
- [ ] Responsive design on mobile
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] No data state displays correctly

---

## 📊 Data Flow

### 1. Dashboard Load
```
User navigates to /my-training
  ↓
MyTraining.jsx mounts
  ↓
Fetches data in parallel:
  - fetchMyTrainings(employeeId)
  - fetchTodaySessions(employeeId)
  - fetchAttendanceStats(employeeId)
  ↓
Displays dashboard with data
```

### 2. View Session Details
```
User clicks on a session
  ↓
Navigate to session detail page
  ↓
Shows: Session info, Training info, Attendance status
```

### 3. View Training Progress
```
User clicks on training card
  ↓
fetchTrainingProgress(employeeId, trainingId)
  ↓
Shows: Detailed progress, Session list, Attendance breakdown
```

---

## 🔐 Security & Permissions

### Access Control
- Only logged-in employees can access
- Users can only view their own training data
- Employee ID from JWT token (not from URL)
- authMiddleware validates user identity

### Backend Validation
```javascript
// In authMiddleware
const tokenEmployeeId = req.user.employeeId;
const requestEmployeeId = parseInt(req.params.employeeId);

if (tokenEmployeeId !== requestEmployeeId) {
  return res.status(403).json({ message: 'Access denied' });
}
```

---

## 🎨 UI Components to Reuse

### Existing Components
- `TableComponent` - For session lists
- `GeneralSearchBar` - For training/session search
- `Grade` - Can be adapted for progress indicators
- `Textfield` - For read-only info display

### New Components Needed
- Progress bar component
- Status badge component
- Statistics card component
- Today's session card component

---

## 📈 Future Enhancements (Phase 2)

1. **Notifications**
   - Alert for upcoming sessions (24 hours before)
   - Reminder for sessions with low attendance
   - Training completion notifications

2. **Calendar View**
   - Month view showing all sessions
   - Click on date to see sessions
   - Export to Google Calendar/Outlook

3. **Mobile App**
   - Mobile-optimized view
   - Push notifications for sessions
   - Quick attendance marking

4. **Feedback & Ratings**
   - Rate completed sessions
   - Provide feedback on trainings
   - View trainer ratings

5. **Certificates**
   - Generate completion certificates
   - Download as PDF
   - Share on LinkedIn

6. **Analytics**
   - Training completion trends
   - Skill acquisition tracking
   - Comparison with peers

---

## ⏱️ Estimated Timeline

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 | Backend Setup | 1-2 days | None |
| Phase 2 | Backend Queries | 1-2 days | Phase 1 |
| Phase 3 | Frontend Components | 2-3 days | Phase 2 |
| Phase 4 | UI/UX Design | 1-2 days | Phase 3 |
| Phase 5 | Integration & Testing | 1-2 days | Phase 4 |
| **Total** | **Complete Feature** | **6-11 days** | - |

---

## 🚀 Success Metrics

### User Satisfaction
- Employees find it easy to track trainings
- Reduced queries to trainers about schedules
- Increased engagement with training content

### Technical Metrics
- Page load time < 2 seconds
- API response time < 500ms
- Zero data inconsistencies
- 99% uptime

### Business Impact
- Improved training attendance rates
- Better training completion rates
- Enhanced employee training experience
- Reduced administrative overhead

---

## 📝 Notes

### Existing Features to Leverage
- **My Status** (`/EmployeeSwitch`) - Shows trainings enrolled
- **EmployeeTrainingDetails** - Shows training sessions and attendance
- Current endpoints for sessions and attendance

### Key Differences
- **My Training** is more comprehensive and dashboard-focused
- Includes today's sessions widget
- Has overall statistics and progress tracking
- Better filtering and search capabilities
- More visual and user-friendly

### Migration Path
- "My Training" can eventually replace "My Status"
- Or keep both: "My Status" for skill matrix, "My Training" for training tracking
- Ensure consistent data across both views

---

## ✅ Checklist Before Starting

- [ ] Review existing training/session/attendance tables
- [ ] Confirm API base URL configuration
- [ ] Set up development environment
- [ ] Create feature branch: `feature/my-training`
- [ ] Review component library for reusable elements
- [ ] Confirm design approval from stakeholders

---

**Created:** September 24, 2026  
**Status:** Planning Phase  
**Priority:** High  
**Assigned To:** Development Team

