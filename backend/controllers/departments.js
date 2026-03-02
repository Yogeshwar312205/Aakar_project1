import { connection } from "../db/index.js";
import express from "express";


const router = express.Router();


router.get('/departments', (req, res) => {
    connection.query('SELECT departmentId, departmentName FROM department', (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  });

  // Export the router
export default router;