import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


//fetch employees
// Add a route to fetch employees
router.get('/api/employees', (req, res) => {
    const { skillIds } = req.query; // Expecting `skillIds` as a comma-separated string of skill IDs
  
    if (!skillIds) {
      return res.status(400).json({ error: 'No skills provided!' });
    }
  
    const skillIdArray = skillIds.split(',').map(Number).filter(Boolean); // Convert to an array of integers
  
    if (skillIdArray.length === 0) {
      return res.status(400).json({ error: 'Invalid skills provided!' });
    }
  
    const placeholders = skillIdArray.map(() => '?').join(','); // Create placeholders for the IN clause
  
    const query = `
      SELECT DISTINCT
        e.employeeId, 
        e.employeeName
      FROM 
        employee e
      INNER JOIN 
        employeeSkill es ON e.employeeId = es.employeeId
      WHERE 
        es.skillId IN (${placeholders})
        AND es.grade = 4
      GROUP BY 
        e.employeeId
      HAVING 
        COUNT(DISTINCT es.skillId) = ?;
    `;
  
    connection.query(query, [...skillIdArray, skillIdArray.length], (err, result) => {
      if (err) {
        // console.error('Error fetching trainers:', err);
        return res.status(500).json({ error: 'Failed to fetch trainers' });
      }
  
      res.json(result);
    });
  });

// Endpoint to fetch employee's training details
router.get('/employee/:employeeId', (req, res) => {
    const employeeId = req.params.employeeId;
    const query = `
      SELECT 
        t.trainingTitle, 
        t.trainingId, 
        e.employeeName, 
        t.startTrainingDate, 
        t.endTrainingDate, 
        empTrainer.employeeName AS trainerName,
        GROUP_CONCAT(s.skillName) AS skillNames  -- Concatenates all associated skill names into a single string
      FROM 
        training t
      JOIN 
        trainingRegistration tr ON t.trainingId = tr.trainingId
      JOIN 
        employee e ON tr.employeeId = e.employeeId
      LEFT JOIN 
        employee empTrainer ON t.trainerId = empTrainer.employeeId
      LEFT JOIN 
        trainingSkills ts ON t.trainingId = ts.trainingId
      LEFT JOIN 
        skill s ON ts.skillId = s.skillId
      WHERE 
        tr.employeeId = ?
      GROUP BY 
        t.trainingId, e.employeeName, empTrainer.employeeName;  -- Group by relevant fields to avoid duplicate rows
    `;
  
    connection.query(query, [employeeId], (err, results) => {
      if (err) {
        // console.error("Error fetching employee's training details: ", err);
        res.status(500).send('Server error');
      } else {
        res.json(results);
      }
    });
  });

  // get deoartment id frgom employess id -- temp 

  router.get('/get-employee-department-id/:employeeId', (req, res) => {
    const employeeId = req.params.employeeId;
    const query = `
    SELECT ed.departmentId, d.departmentName
    FROM employeeDesignation ed
    JOIN department d ON ed.departmentId = d.departmentId
    WHERE ed.employeeId = ?
    `;

    connection.query(query, [employeeId], (error, result) => {
        if (error) {
            // console.error("Error in getting department details:", error);
            return res.status(500).send("Error in getting department details");
        }

        res.json(result);
    });
});

  
  // Endpoint to fetch employee's skill matrix to display in employeePOV
  router.get('/employeeSkill/:employeeId', (req, res) => {
    const employeeId = req.params.employeeId;
  
    // SQL query to get skill matrix for employee
    const query = `
      SELECT
    d.departmentName,
    s.skillName,
    es.grade
FROM
    department d
JOIN departmentSkill ds ON d.departmentId = ds.departmentId
JOIN skill s ON ds.skillId = s.skillId
JOIN employeeDesignation ed ON ed.departmentId = d.departmentId
JOIN employeeSkill es ON es.skillId = s.skillId AND es.employeeId = ?  -- Employee ID
WHERE
    ed.employeeId = ? 
    AND s.skillActivityStatus = 1
    AND (
        (ds.departmentSkillType = 2 AND ds.departmentSkillStatus = 1)
        OR (ds.departmentSkillType = 3)
    )
ORDER BY
    d.departmentId, s.skillId;

  
    `;
  
    // Execute the query
    connection.query(query, [employeeId, employeeId], (err, results) => {
      if (err) {
        // console.error("Error fetching skill matrix: ", err);
        res.status(500).send('Server error');
      } else {
        res.json(results);
      }
    });
  });

  router.get(`/GetEmpFormRegister`,(req,res) =>{
    connection.query(`select * from trainingRegistration`,(err,result)=>{
      if(err){
        console.error("Geting error from emp register ",err)
        return res.status(500).json({ error: 'Error fetching data from registration' });
      }
      res.json(result);
      // console.log('Emp from Registration .',result);
    })
  })

// API to check employee access (employeeAccess and trainerAccess)
router.get('/GetEmployeeAccess', (req, res) => {
  const { employeeId } = req.query; // Assuming employeeId is sent as a query parameter

  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  // Query to check if the employee is registered for training
  const checkEmployeeQuery = `
    SELECT COUNT(*) AS isRegistered
    FROM trainingRegistration
    WHERE employeeId = ?;
  `;

  // Query to check if the employee is a trainer
  const checkTrainerQuery = `
    SELECT COUNT(*) AS isTrainer
    FROM training
    WHERE trainerId = ?;
  `;

  // Execute both queries
  connection.query(checkEmployeeQuery, [employeeId], (err, employeeResult) => {
    if (err) {
      console.error('Error fetching employee registration data:', err);
      return res
        .status(500)
        .json({ error: 'Error fetching employee registration data' });
    }

    connection.query(checkTrainerQuery, [employeeId], (err, trainerResult) => {
      if (err) {
        console.error('Error fetching trainer data:', err);
        return res
          .status(500)
          .json({ error: 'Error fetching trainer data' });
      }

      // Response: Combine both results into a single object
      res.json({
        isRegistered: employeeResult[0].isRegistered > 0, // 1 if found, 0 otherwise
        isTrainer: trainerResult[0].isTrainer > 0, // 1 if found, 0 otherwise
      });

      console.log('Access check result:', {
        isRegistered: employeeResult[0].isRegistered > 0,
        isTrainer: trainerResult[0].isTrainer > 0,
      });
    });
  });
});

  // Export the router
export default router;