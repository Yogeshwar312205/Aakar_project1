import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


router.get('/skills/:departmentId', (req, res) => {
    const departmentId = req.params.departmentId;
    connection.query('SELECT skillId, skillName ,departmentIdGivingTraining, skillDescription FROM skill WHERE departmentId = ? AND skillActivityStatus = 1', [departmentId], (err, result) => {
      if (err) throw err;
      res.send(result);
      console.log(result);
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