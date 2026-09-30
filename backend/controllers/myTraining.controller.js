import { connection } from '../db/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

// Get all enrolled trainings with progress and attendance stats
export const getMyTrainings = (req, res) => {
    const { employeeId } = req.params;

    const query = `
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
            END AS trainingStatus,
            ROUND(
                (COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) / 
                NULLIF(COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END), 0)) * 100, 
                2
            ) AS attendancePercentage
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
        ORDER BY t.startTrainingDate DESC
    `;

    connection.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching my trainings:', err);
            return res.status(500).json({ error: 'Failed to fetch trainings' });
        }

        // Debug logging
        console.log('📊 Training Status Debug:');
        console.log('Current Date (CURDATE):', new Date().toISOString().split('T')[0]);
        results.forEach(training => {
            console.log(`Training ${training.trainingId}: ${training.trainingTitle}`);
            console.log(`  Start: ${training.startTrainingDate}, End: ${training.endTrainingDate}`);
            console.log(`  Status: ${training.trainingStatus}`);
        });

        res.status(200).json({ success: true, data: results });
    });
};

// Get today's sessions for the employee
export const getTodaySessions = (req, res) => {
    const { employeeId } = req.params;

    const query = `
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
        ORDER BY ses.sessionStartTime
    `;

    connection.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching today\'s sessions:', err);
            return res.status(500).json({ error: 'Failed to fetch today\'s sessions' });
        }

        res.status(200).json({ success: true, data: results });
    });
};

// Get all sessions with optional filter (upcoming/completed/all)
export const getAllSessions = (req, res) => {
    const { employeeId } = req.params;
    const { filter = 'all' } = req.query;

    const query = `
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
          AND (? = 'all' 
            OR (? = 'upcoming' AND ses.sessionDate >= CURDATE())
            OR (? = 'completed' AND ses.sessionDate < CURDATE()))
        ORDER BY ses.sessionDate DESC, ses.sessionStartTime DESC
    `;

    connection.query(query, [employeeId, filter, filter, filter], (err, results) => {
        if (err) {
            console.error('Error fetching sessions:', err);
            return res.status(500).json({ error: 'Failed to fetch sessions' });
        }

        res.status(200).json({ success: true, data: results });
    });
};

// Get detailed progress for a specific training
export const getTrainingProgress = (req, res) => {
    const { employeeId, trainingId } = req.params;

    const query = `
        SELECT 
            t.trainingId,
            t.trainingTitle,
            t.startTrainingDate,
            t.endTrainingDate,
            COUNT(DISTINCT ses.sessionId) AS totalSessions,
            COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END) AS pastSessions,
            COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) AS attendedSessions,
            COUNT(DISTINCT CASE WHEN a.attendanceStatus = 0 THEN a.sessionId END) AS missedSessions,
            ROUND(
                (COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) / 
                NULLIF(COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END), 0)) * 100, 
                2
            ) AS attendancePercentage
        FROM training t
        JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
        LEFT JOIN sessions ses ON t.trainingId = ses.trainingId
        LEFT JOIN attendance a ON ses.sessionId = a.sessionId AND a.employeeId = tr.employeeId
        WHERE tr.employeeId = ? AND t.trainingId = ?
        GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate
    `;

    connection.query(query, [employeeId, trainingId], (err, results) => {
        if (err) {
            console.error('Error fetching training progress:', err);
            return res.status(500).json({ error: 'Failed to fetch training progress' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Training not found' });
        }

        res.status(200).json({ success: true, data: results[0] });
    });
};

// Get overall attendance statistics
export const getAttendanceStats = (req, res) => {
    const { employeeId } = req.params;

    const query = `
        SELECT 
            COUNT(DISTINCT t.trainingId) AS totalTrainings,
            COUNT(DISTINCT CASE WHEN CURDATE() BETWEEN t.startTrainingDate AND t.endTrainingDate THEN t.trainingId END) AS ongoingTrainings,
            COUNT(DISTINCT CASE WHEN CURDATE() > t.endTrainingDate THEN t.trainingId END) AS completedTrainings,
            COUNT(DISTINCT ses.sessionId) AS totalSessions,
            COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END) AS pastSessions,
            COUNT(DISTINCT CASE WHEN ses.sessionDate = CURDATE() THEN ses.sessionId END) AS todaySessions,
            COUNT(DISTINCT CASE WHEN ses.sessionDate > CURDATE() THEN ses.sessionId END) AS upcomingSessions,
            COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) AS attendedSessions,
            COUNT(DISTINCT CASE WHEN a.attendanceStatus = 0 THEN a.sessionId END) AS missedSessions,
            ROUND(
                (COUNT(DISTINCT CASE WHEN a.attendanceStatus = 1 THEN a.sessionId END) / 
                NULLIF(COUNT(DISTINCT CASE WHEN ses.sessionDate < CURDATE() THEN ses.sessionId END), 0)) * 100, 
                2
            ) AS overallAttendancePercentage
        FROM training t
        JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
        LEFT JOIN sessions ses ON t.trainingId = ses.trainingId
        LEFT JOIN attendance a ON ses.sessionId = a.sessionId AND a.employeeId = tr.employeeId
        WHERE tr.employeeId = ?
    `;

    connection.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching attendance stats:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance statistics' });
        }

        res.status(200).json({ success: true, data: results[0] });
    });
};
