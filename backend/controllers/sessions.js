import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


//start Session //
router.get('/training/sessions/:trainingId', (req, res) => {
    const trainingId = req.params.trainingId;
    const trainingQuery = `
    SELECT t.trainingTitle, empTrainer.employeeName AS trainerName, t.startTrainingDate, t.endTrainingDate FROM training t 
    LEFT JOIN employee empTrainer ON t.trainerId = empTrainer.employeeId
    WHERE t.trainingId = ?;`;
  
    const skillsQuery = `
      SELECT GROUP_CONCAT(skill.skillName SEPARATOR ', ') AS skills 
      FROM trainingSkills 
      JOIN skill ON trainingSkills.skillId = skill.skillId 
      WHERE trainingSkills.trainingId = ?`;
  
    connection.query(trainingQuery, [trainingId], (err, trainingResult) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error');
      }
      if (trainingResult.length === 0) {
        return res.status(404).send('Training session not found');
      }
  
      connection.query(skillsQuery, [trainingId], (err, skillsResult) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Internal Server Error');
        }
  
        const response = {
          ...trainingResult[0],
          skills: skillsResult[0].skills || '' 
        };
        res.send(response);
      });
    });
  });
  
  
  router.post('/api/sessions', (req, res) => {
    const { sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription, trainingId } = req.body;
    const formattedDate = sessionDate;
    const query = 'INSERT INTO sessions (sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription, trainingId) VALUES (?, ?, ?, ?, ?, ?)';
  
    connection.query(query, [sessionName, formattedDate, sessionStartTime, sessionEndTime, sessionDescription, trainingId], (err, results) => {
      if (err) {
        console.error('Error inserting session:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        sessionId: results.insertId,
        sessionName,
        sessionDate: formattedDate,
        sessionStartTime,
        sessionEndTime,
        sessionDescription,
        trainingId,
      });
    });
  });
  
  // Update an existing session
  router.put('/api/sessions/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const { sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription } = req.body;
    
    const formattedDate = sessionDate;
    const query = `
      UPDATE sessions 
      SET sessionName = ?, sessionDate = ?, sessionStartTime = ?, sessionEndTime = ?, sessionDescription = ? 
      WHERE sessionId = ?
    `;
  
    connection.query(query, [sessionName, formattedDate, sessionStartTime, sessionEndTime, sessionDescription, sessionId], (err, results) => {
      if (err) {
        console.error('Error updating session:', err);
        return res.status(500).json({ error: err.message });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
  
      res.status(200).json({
        sessionId,
        sessionName,
        sessionDate: formattedDate,
        sessionStartTime,
        sessionEndTime,
        sessionDescription,
      });
    });
  });
  
  router.delete('/api/sessions/:id', (req, res) => {
    const sessionId = req.params.id;
    const sql = 'DELETE FROM sessions WHERE sessionId = ?';
  
    connection.query(sql, [sessionId], (err, result) => {
      if (err) {
        console.error("Error deleting session:", err);
        return res.status(500).send('Server error');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Session not found');
      }
      res.send('Session deleted successfully');
    });
  });
  
  
  router.get('/training/all_sessions/:trainingId', (req, res) => {
    const trainingId = req.params.trainingId;
    const query = 'SELECT sessionId, sessionName, sessionDate, sessionStartTime, sessionEndTime, sessionDescription FROM sessions WHERE trainingId = ?';
    
    connection.query(query, [trainingId], (err, result) => {
      if (err) {
        console.error('Error fetching session data:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result); 
    });
  });



  // Export the router
export default router;