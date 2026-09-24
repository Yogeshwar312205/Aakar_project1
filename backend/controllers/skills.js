import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


router.get('/skills/:departmentId', (req, res) => {
    const departmentId = req.params.departmentId;
    
    // Updated query to include skills from other departments that are marked as applicable
    // This query returns:
    // 1. Skills owned by this department (s.departmentId = ?)
    // 2. Skills from other departments where this department has access (ds.departmentId = ? AND ds.departmentSkillType IN (1, 2, 3))
    const query = `
      SELECT DISTINCT s.skillId, s.skillName, s.departmentIdGivingTraining, s.skillDescription, s.departmentId
      FROM skill s
      LEFT JOIN departmentSkill ds ON s.skillId = ds.skillId
      WHERE s.skillActivityStatus = 1
        AND (
          s.departmentId = ? 
          OR (ds.departmentId = ? AND ds.departmentSkillType IN (1, 2, 3) AND ds.departmentSkillStatus = 1)
        )
      ORDER BY s.skillName
    `;
    
    connection.query(query, [departmentId, departmentId], (err, result) => {
      if (err) {
        console.error('Error fetching skills:', err);
        return res.status(500).json({ error: 'Failed to fetch skills' });
      }
      res.send(result);
      console.log(`Fetched ${result.length} skills for department ${departmentId}`);
    });
  });
  
  
  router.get('/skills', (req, res) => {
    connection.query('SELECT * FROM skill WHERE skillActivityStatus = ?', [true], (err, result) => {
      if (err) throw err;
      res.json(result);
      console.log(result);
    });
  });

  // Export the router
export default router;