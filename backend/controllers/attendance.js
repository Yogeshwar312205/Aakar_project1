import { connection } from "../db/index.js";
import express from "express";
const router = express.Router();


//attendence display in ManegerPOV
router.get('/api/sessions/attendance/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    const sql = `SELECT e.employeeName, IF(a.attendanceStatus IS NULL, 0, a.attendanceStatus) as attendanceStatus
      FROM trainingRegistration tr
      JOIN sessions s ON tr.trainingId = s.trainingId
      LEFT JOIN attendance a ON tr.employeeId = a.employeeId AND a.sessionId = ?
      JOIN employee e ON tr.employeeId = e.employeeId
      WHERE s.sessionId = ?`;
  
    connection.query(sql, [sessionId, sessionId], (err, results) => {
      if (err) {
        // console.error('Error fetching attendance:', err.message);
        return res.status(500).json({ error: 'Server error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'No attendance records found for this session.' });
      }
  
      res.json(results); 
    });
  });
  
  
  // Api for fetching Attendence data in EmployeePOV
  router.get('/api/attendance', (req, res) => {
    const { employeeId, sessionId } = req.query;
  
    connection.query('SELECT attendanceStatus FROM attendance WHERE employeeId = ? AND sessionId = ?', [employeeId, sessionId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (results.length > 0) {
        res.json({ attendanceStatus: results[0].attendanceStatus });
      } else {
        res.json({ attendanceStatus: null }); // Return null if no record found
      }
    });
  });

  router.post('/saveAttendance', (req, res) => {
    const attendanceData = req.body; 
    if (!attendanceData || attendanceData.length === 0) {
      return res.status(400).send('No attendance data provided.');
    }
    const { sessionId } = attendanceData[0]; 
  
    const values = attendanceData
      .map(entry => `(${entry.employeeId}, ${sessionId}, ${entry.attendanceStatus})`) // Add parentheses around each set of values
      .join(',');
  
    const sqlQuery = `
      INSERT INTO attendance (employeeId, sessionId, attendanceStatus)
      VALUES ${values}
      ON DUPLICATE KEY UPDATE attendanceStatus = VALUES(attendanceStatus);`;
  
    connection.query(sqlQuery, (err, result) => {
      if (err) {
        // console.error('Error inserting attendance:', err);
        return res.status(500).send('Error saving attendance.');
      }
      res.send('Attendance saved successfully.');
    });
  });

// API to fetch attendance data for a specific sessionId
router.get('/viewAttendance/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const query = `SELECT a.employeeId, e.employeeName, d.departmentName, a.attendanceStatus
      FROM attendance a
      INNER JOIN employee e ON a.employeeId = e.employeeId
      LEFT JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
      LEFT JOIN department d ON ed.departmentId = d.departmentId
      WHERE a.sessionId = ?;`;
  
    connection.query(query, [sessionId], (err, results) => {
      if (err) {
        // console.error('Database query error:', err);
        return res.status(500).send('Database query error.');
      }
  
      if (results.length === 0) {
        // No attendance records found
        return res.status(404).send('No attendance record found.');
      }
  
      res.json(results);
    });
  });

// Endpoint to save feedback
router.post('/saveFeedback', (req, res) => {
  const feedbackArray = req.body;
  
  const query = `UPDATE trainingRegistration SET trainerFeedback = ? 
    WHERE employeeId = ? AND trainingId = ?`;
console.log("fvibhwbhs")
  feedbackArray.forEach((feedback) => {
    const { employeeId, trainingId, trainerFeedback } = feedback;

    connection.query(query, [trainerFeedback, employeeId, trainingId], (err, result) => {
      if (err) {
        // console.error('Error executing query for employeeId:', employeeId, err);
        return res.status(500).json({ message: 'Error saving feedback' });
      }
    });
  });
  res.status(200).json({ message: 'Feedback saved successfully' });
});

// Export the router
export default router;