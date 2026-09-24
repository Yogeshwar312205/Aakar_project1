import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


//Trainer
// Endpoint to fetch employee details enrolled in a specific training
router.get('/TrainerEmployees/:trainingId', (req, res) => {
    const trainingId = req.params.trainingId;
  
    const query = `
      SELECT 
        e.employeeId, 
        e.employeeName, 
        d.departmentName,
        t.trainingTitle, 
        t.startTrainingDate, 
        t.endTrainingDate
      FROM 
        trainingRegistration tr
      LEFT JOIN 
        employee e ON tr.employeeId = e.employeeId
      LEFT JOIN 
        employeeDesignation ed ON e.employeeId = ed.employeeId
      LEFT JOIN 
        department d ON ed.departmentId = d.departmentId
      LEFT JOIN 
        training t ON tr.trainingId = t.trainingId
      WHERE 
        tr.trainingId = ?;
    `;
  
    connection.query(query, [trainingId], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Database query error");
      } else {
        res.json(results); // Return the list of enrolled employees
      }
    });
  });
  
  
  // Endpoint to fetch trainer's training details with total employee count
  router.get('/TrainerTrainings/:employeeId', (req, res) => {
    const trainerId = req.params.employeeId;
  
    const query = `
      SELECT 
        t.trainingId, 
        t.trainingTitle, 
        t.startTrainingDate, 
        t.endTrainingDate,
        GROUP_CONCAT(DISTINCT s.skillName) AS skillNames,
        COUNT(DISTINCT tr.employeeId) AS totalEmployees
      FROM 
        training t
      LEFT JOIN 
        trainingSkills ts ON t.trainingId = ts.trainingId
      LEFT JOIN 
        skill s ON ts.skillId = s.skillId
      LEFT JOIN 
        trainingRegistration tr ON t.trainingId = tr.trainingId
      LEFT JOIN 
        employee e ON tr.employeeId = e.employeeId
      LEFT JOIN 
        employeeDesignation ed ON e.employeeId = ed.employeeId
      LEFT JOIN 
        department d ON ed.departmentId = d.departmentId
      WHERE 
        t.trainerId = ?
      GROUP BY 
        t.trainingId;
    `;
  
    connection.query(query, [trainerId], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Database query error");
      } else if (results.length === 0) {
        res.json([]); // Return empty array so frontend gracefully displays 0 trainings
      } else {
        res.json(results); // Return training data along with total employee count
      }
    });
  });

// Endpoint to fetch employees enrolled in a specific training
router.get('/employeesEnrolled/:trainingId', (req, res) => {
  const trainingId = req.params.trainingId;
  const query = `
    SELECT 
      e.employeeId, 
      e.employeeName, 
      d.departmentName, 
      tr.trainerFeedback,
      s.skillId,
      s.skillName,
      COALESCE(es.grade, 0) AS grade
    FROM trainingRegistration tr
    INNER JOIN employee e ON tr.employeeId = e.employeeId
    LEFT JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
    LEFT JOIN department d ON ed.departmentId = d.departmentId
    LEFT JOIN trainingSkills ts ON tr.trainingId = ts.trainingId
    LEFT JOIN skill s ON ts.skillId = s.skillId
    LEFT JOIN employeeSkill es ON e.employeeId = es.employeeId AND s.skillId = es.skillId
    WHERE tr.trainingId = ?;
  `;

  connection.query(query, [trainingId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).send("Database query error");
    } else if (results.length === 0) {
      res.status(404).send("No employees found for the given training");
    } else {
      res.json(results);
    }
  });
});

router.get("/api/employeeoneCount", (req, res) => {
  const { departmentId } = req.query;

  // Validate input
  if (!departmentId ) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

 


  
  // Prepare the query with IN clause and placeholders
  const query = `
    SELECT 
    e.employeeName,
    e.employeeId,
    d.departmentName AS employeeDepartmentName,
    t.trainingTitle,
    t.trainingId,
    t.startTrainingDate AS trainingStartDate,
    t.endTrainingDate AS trainingEndDate,
    (
        SELECT GROUP_CONCAT(DISTINCT sk.skillName ORDER BY sk.skillName SEPARATOR ', ')
        FROM trainingSkills ts
        JOIN skill sk ON ts.skillId = sk.skillId
        WHERE ts.trainingId = t.trainingId
    ) AS skillsIncluded
FROM 
    training t
JOIN 
    trainingRegistration tr ON t.trainingId = tr.trainingId
JOIN 
    employee e ON tr.employeeId = e.employeeId
JOIN 
    employeeDesignation ed ON e.employeeId = ed.employeeId
JOIN 
    department d ON ed.departmentId = d.departmentId
WHERE 
    EXISTS (
        SELECT 1
        FROM departmentSkill ds
        WHERE ds.skillId IN (
            SELECT skillId 
            FROM trainingSkills 
            WHERE trainingId = t.trainingId
        )
        AND ds.departmentSkillType IN (1,3)
        AND ds.departmentId = ?
    )
GROUP BY 
    e.employeeId, d.departmentName, t.trainingId, t.startTrainingDate, t.endTrainingDate;

  `;

  // Execute the query with skillTypes and departmentId as parameters
  connection.query(query, [ departmentId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error executing query.", details: err.message });
    }

    // Return the results as JSON
    res.json({ count: results.length, data: results });
  });
});

router.get("/api/employeetwoCount", (req, res) => {
  const { departmentId } = req.query;

  // Validate input
  if (!departmentId ) {
    return res.status(400).json({ message: "Missing required parameters" });
  }
  
  // Prepare the query with IN clause and placeholders
  const query = `
    SELECT 
      e.employeeName,
      e.employeeId,
      d.departmentName AS employeeDepartmentName,
      t.trainingTitle,
      t.trainingId,
      t.startTrainingDate AS trainingStartDate,
      t.endTrainingDate AS trainingEndDate,
      (
        SELECT GROUP_CONCAT(DISTINCT sk.skillName ORDER BY sk.skillName SEPARATOR ', ')
        FROM trainingSkills ts
        JOIN skill sk ON ts.skillId = sk.skillId
        WHERE ts.trainingId = t.trainingId
      ) AS skillsIncluded
    FROM 
      training t
    JOIN 
      trainingRegistration tr ON t.trainingId = tr.trainingId
    JOIN 
      employee e ON tr.employeeId = e.employeeId
    JOIN 
      employeeDesignation ed ON e.employeeId = ed.employeeId
    JOIN 
      department d ON ed.departmentId = d.departmentId
    WHERE 
      EXISTS (
        SELECT 1
        FROM departmentSkill ds
        WHERE ds.skillId IN (
            SELECT skillId FROM trainingSkills WHERE trainingId = t.trainingId
        )
        AND ds.departmentSkillType IN (2,3)
      )
      AND ed.departmentId = ?
    GROUP BY 
      e.employeeId, d.departmentName, t.trainingId, t.startTrainingDate, t.endTrainingDate;

  `;

  // Execute the query with skillTypes and departmentId as parameters
  connection.query(query, [ departmentId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error executing query.", details: err.message });
    }

    // Return the results as JSON
    res.json({ count: results.length, data: results });
  });
});

// Endpoint to fetch complete attendance and grading summary for a training
router.get('/api/training/:trainingId/full-attendance-summary', async (req, res) => {
  const { trainingId } = req.params;

  try {
    // 1. Fetch all sessions for this training
    const [sessions] = await connection.promise().query(
      `SELECT sessionId, sessionName, sessionDate, sessionStartTime, sessionEndTime
       FROM sessions
       WHERE trainingId = ?
       ORDER BY sessionDate ASC`,
      [trainingId]
    );

    // 2. Fetch all enrolled employees with skill and grade
    const [employees] = await connection.promise().query(
      `SELECT 
        e.employeeId,
        e.employeeName,
        d.departmentName,
        s.skillId,
        s.skillName,
        COALESCE(es.grade, 0) AS grade,
        tr.trainerFeedback
      FROM trainingRegistration tr
      INNER JOIN employee e ON tr.employeeId = e.employeeId
      LEFT JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
      LEFT JOIN department d ON ed.departmentId = d.departmentId
      LEFT JOIN trainingSkills ts ON tr.trainingId = ts.trainingId
      LEFT JOIN skill s ON ts.skillId = s.skillId
      LEFT JOIN employeeSkill es ON e.employeeId = es.employeeId AND s.skillId = es.skillId
      WHERE tr.trainingId = ?
      GROUP BY e.employeeId, s.skillId
      ORDER BY e.employeeName ASC`,
      [trainingId]
    );

    // 3. Fetch attendance matrix
    const [attendance] = await connection.promise().query(
      `SELECT a.sessionId, a.employeeId, a.attendanceStatus
       FROM attendance a
       JOIN sessions s ON a.sessionId = s.sessionId
       WHERE s.trainingId = ?`,
      [trainingId]
    );

    // Map attendance per employee
    const attendanceMap = {};
    attendance.forEach(att => {
      const key = `${att.employeeId}-${att.sessionId}`;
      attendanceMap[key] = att.attendanceStatus;
    });

    const result = employees.map(emp => {
      const empSessions = sessions.map(sess => ({
        sessionId: sess.sessionId,
        sessionName: sess.sessionName,
        sessionDate: sess.sessionDate,
        status: attendanceMap[`${emp.employeeId}-${sess.sessionId}`] ?? 0
      }));

      const attendedCount = empSessions.filter(s => s.status === 1).length;

      return {
        ...emp,
        sessions: empSessions,
        totalSessions: sessions.length,
        attendedSessions: attendedCount,
        attendancePercentage: sessions.length > 0 ? Math.round((attendedCount / sessions.length) * 100) : 0
      };
    });

    res.json({
      sessions,
      attendees: result
    });
  } catch (err) {
    console.error('Error fetching full attendance summary:', err);
    res.status(500).json({ error: 'Failed to fetch attendance summary', details: err.message });
  }
});

// Endpoint to update student attendance for a session
router.post('/api/attendance/update-single', async (req, res) => {
  const { employeeId, sessionId, attendanceStatus } = req.body;
  try {
    await connection.promise().query(
      `INSERT INTO attendance (employeeId, sessionId, attendanceStatus)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE attendanceStatus = VALUES(attendanceStatus)`,
      [employeeId, sessionId, attendanceStatus]
    );
    res.json({ success: true, message: 'Attendance updated' });
  } catch (err) {
    console.error('Error updating attendance:', err);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Export the router
export default router;