import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


router.get('/check-grade', (req, res) => {
    const { employeeId, skillId } = req.query;  // Use req.query for GET request parameters
    const query = 'SELECT COUNT(*) AS count FROM employeeSkill WHERE employeeId = ? AND skillId = ?';
  
    connection.query(query, [employeeId, skillId], (err, results) => {
      if (err) {
        console.error('Error checking grade:', err);  // Log the error
        return res.status(500).json({ error: 'Error checking grade.' });
      }
      res.json({ exists: results[0].count > 0 });
    });
  });
  
  
  router.post('/update-grade', (req, res) => {
    const { employeeId, skillId, grade } = req.body;
  
    const query = 
      `UPDATE employeeSkill 
       SET grade = ? 
       WHERE employeeId = ? AND skillId = ?`;
  
    connection.query(query, [grade, employeeId, skillId], (err, result) => {
      if (err) {
        console.error('Error updating grade:', err);
        return res.status(500).send('Failed to update grade');
      }
      res.send({ message: 'Grade updated successfully' });
    });
  });
  
  
  router.post('/add-grade', (req, res) => {
    const { employeeId, skillId, grade } = req.body;
    const query = 'INSERT INTO employeeSkill (employeeId, skillId, grade) VALUES (?, ?, ?)';
    connection.query(query, [employeeId, skillId, grade], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding grade.' });
      }
      res.status(201).json({ success: true });
    });
  });

  // Export the router
export default router;