import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


router.get('/trainer-employee', (req, res) => {
    const { skillIds } = req.query;

    if (!skillIds) {
      return res.status(400).json({ error: 'No skills provided!' });
    }

    const skillIdArray = skillIds.split(',').map(Number).filter(Boolean);

    if (skillIdArray.length === 0) {
      return res.status(400).json({ error: 'Invalid skills provided!' });
    }

    const placeholders = skillIdArray.map(() => '?').join(',');

    // Step 1: Fetch the department and skill types for the given skills
    const query1 = `
      SELECT DISTINCT skillId, departmentId, departmentSkillType
      FROM departmentSkill
      WHERE skillId IN (${placeholders})
        AND (departmentSkillType = 1 OR departmentSkillType = 3)
    `;

    connection.query(query1, skillIdArray, (err, result) => {
      if (err) {
        console.error('Error fetching department and skill types:', err);
        return res.status(500).json({ error: 'Error fetching department and skill types' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'No matching departments or skills found' });
      }

      const departmentId = result[0].departmentId;
      const type1Skills = result
        .filter((row) => row.departmentSkillType === 1)
        .map((row) => row.skillId);
      const type3Skills = result
        .filter((row) => row.departmentSkillType === 3)
        .map((row) => row.skillId);

      // Construct query and parameters based on the skill types
      let internalTrainerQuery = '';
      let queryParams = [];

      if (type3Skills.length > 0) {
        const placeholdersSkill = type3Skills.map(() => '?').join(',');
        internalTrainerQuery = `
          SELECT DISTINCT ed.employeeId, e.employeeName, 'internal' as trainerType
          FROM employee e
          INNER JOIN employeeSkill es ON e.employeeId = es.employeeId
          JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
          WHERE es.skillId IN (${placeholdersSkill})
            AND es.grade = 4
            AND ed.departmentId = ? 
            AND e.userType = 'internal'
          GROUP BY ed.employeeId
          HAVING COUNT(DISTINCT es.skillId) = ${type3Skills.length}
        `;
        queryParams = [...type3Skills, departmentId];
      } else if (type1Skills.length > 0) {
        internalTrainerQuery = `
          SELECT DISTINCT e.employeeId, e.employeeName, 'internal' as trainerType
          FROM employee e
          JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
          WHERE ed.departmentId = ?
            AND e.userType = 'internal'
        `;
        queryParams = [departmentId];
      } else {
        return res.status(404).json({ error: 'No matching employees found' });
      }

      // Query for external trainers with matching skills and active access
      const externalTrainerQuery = `
        SELECT DISTINCT e.employeeId, e.employeeName, 'external' as trainerType
        FROM employee e
        INNER JOIN externalTrainerSkills ets ON e.employeeId = ets.employeeId
        WHERE e.userType = 'external_trainer'
          AND ets.skillId IN (${placeholders})
          AND CURDATE() BETWEEN e.accessStartDate AND e.accessEndDate
        GROUP BY e.employeeId
        HAVING COUNT(DISTINCT ets.skillId) = ${skillIdArray.length}
      `;

      // Execute both queries in parallel
      Promise.all([
        new Promise((resolve, reject) => {
          connection.query(internalTrainerQuery, queryParams, (err, results) => {
            if (err) reject(err);
            else resolve(results || []);
          });
        }),
        new Promise((resolve, reject) => {
          connection.query(externalTrainerQuery, skillIdArray, (err, results) => {
            if (err) reject(err);
            else resolve(results || []);
          });
        })
      ])
      .then(([internalTrainers, externalTrainers]) => {
        // Combine both internal and external trainers
        const allTrainers = [...internalTrainers, ...externalTrainers];
        return res.status(200).json(allTrainers);
      })
      .catch(err => {
        console.error('Error fetching trainers:', err);
        return res.status(500).json({ error: 'Error fetching trainers' });
      });
    });
  });


  router.get('/training-employee', (req, res) => {
    const { skillIds, departmentId } = req.query;

    if (!skillIds || !departmentId) {
      return res.status(400).json({ error: 'Skill IDs and Department ID are required' });
    }

    const skillIdArray = skillIds.split(',').map(Number).filter(Boolean);

    if (skillIdArray.length === 0) {
      return res.status(400).json({ error: 'Invalid skill IDs provided' });
    }

    const placeholders = skillIdArray.map(() => '?').join(',');

    // Step 1: Fetch employees for departmentSkillType = 1
    const query1 = `
  SELECT DISTINCT es.employeeId, e.employeeName
      FROM employee e
      JOIN employeeSkill es ON e.employeeId = es.employeeId
      JOIN departmentSkill s ON es.skillId = s.skillId
      JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
      where s.departmentSkillType = 3 and ed.departmentId = ?;
    `;

    // Step 2: Fetch employees with grade 4 for skills with departmentSkillType = 3
    const query2 = `
      SELECT DISTINCT e.employeeId, e.employeeName
      FROM employee e
      JOIN employeeSkill es ON e.employeeId = es.employeeId
      JOIN skill s ON es.skillId = s.skillId
      JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
      WHERE s.skillType = 3 AND es.grade = 4 AND es.skillId IN (${placeholders}) AND ed.departmentId = ?
    `;

    // Execute both queries
    Promise.all([
      new Promise((resolve, reject) => {
        connection.query(query1, [departmentId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        connection.query(query2, [...skillIdArray, departmentId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      })
    ])
      .then(([type1Employees, type3Employees]) => {
        let finalEmployees;

        if (type1Employees.length > 0 && type3Employees.length > 0) {
          // Find intersection of both results
          const type1Set = new Set(type1Employees.map(emp => emp.employeeId));
          finalEmployees = type3Employees.filter(emp => type1Set.has(emp.employeeId));
        } else {
          // Use the available results
          finalEmployees = type1Employees.length > 0 ? type1Employees : type3Employees;
        }

        res.json(finalEmployees);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Failed to fetch data' });
      });
  });

//Give Training
router.get(`/GetDeptGiveTrainData/:dept_id`,(req,res) =>{
  const deptId = req.params.dept_id;
  const query = `SELECT at.employeeId, e.employeeName, s.skillName, es.skillId, es.grade
    FROM selectedAssignTraining at
    JOIN employeeSkill es ON es.employeeId = at.employeeId AND es.skillId = at.skillId
    JOIN skill s ON at.skillId = s.skillId
    JOIN employee e ON e.employeeId = at.employeeId
    WHERE s.departmentIdGivingTraining = ?`;

    connection.query(query, [deptId], (err, result) => {
      if (err) {
        console.error('Error in fetching Department Giving Training', err);
        return res.status(500).json({ error: 'Error fetching data' });
      }
      // console.log("Fetching department giving training", result);
      res.json(result);
    });
});


// department Giving Training
router.get(`/GetDeptGiveTrainData/:dept_id/:skill_id?`, (req, res) => {
  const deptId = req.params.dept_id;
  const skillId = req.params.skill_id;
  const query = `SELECT at.employeeId, e.employeeName, s.skillName, es.skillId, es.grade
  FROM selectedAssignTraining at
  JOIN employeeSkill es ON es.employeeId = at.employeeId AND es.skillId = at.skillId
  JOIN skill s ON at.skillId = s.skillId
  JOIN employee e ON e.employeeId = at.employeeId
  WHERE s.departmentIdGivingTraining = ? AND es.skillId = ?`;

  connection.query(query, [deptId, skillId], (err, result) => {
    if (err) {
      console.error('Error in fetching Department Giving Training by Skill', err);
      return res.status(500).json({ error: 'Error fetching data' });
    }
    // console.log("Fetching department giving training by skill", result);
    res.json(result);
  });
  }
);

// Getting skill names which give training by particular department
// Updated to show:
// 1. Skills this department can give training for (type 1 or 3)
// 2. Skills from other departments that are available for cross-department training (type 1 or 3)
router.get(`/DepartmentGiveTskills/:dept_id`,(req,res)=>{
  const deptId = req.params.dept_id;
  const query = `
    SELECT DISTINCT s.skillName, s.skillId, ds.departmentId, d.departmentName
    FROM departmentSkill ds
    JOIN skill s ON ds.skillId = s.skillId
    JOIN department d ON ds.departmentId = d.departmentId
    WHERE s.skillActivityStatus = 1
      AND ds.departmentSkillStatus = 1
      AND (
        -- Skills owned by this department (can give training)
        (ds.departmentId = ? AND ds.departmentSkillType IN (1, 3))
        OR
        -- Skills from other departments available for cross-department training
        (ds.departmentId != ? AND ds.departmentSkillType IN (1, 3))
      )
    ORDER BY s.skillName
  `;
  
  connection.query(query, [deptId, deptId], (err, result) => {
    if(err){
      console.error('Error in fetching Skill Training by Department', err);
      return res.status(500).json({ error: 'Error fetching data' });
    }
    
    // Map to ensure consistent format (skillId and skillName)
    const formattedResult = result.map(skill => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      departmentId: skill.departmentId,
      departmentName: skill.departmentName
    }));
    
    res.json(formattedResult);
    console.log(`Fetched ${formattedResult.length} skills for department ${deptId}`);
  })
})

router.post('/send-multiple-emps-to-trainings', (req, res) => {
  const { trainingId, selectedEmployees, selectedEmpToRemove } = req.body;

  // Validate input
  if (!trainingId) {
    return res.status(400).json({ error: 'Missing trainingId' });
  }

  // Validate selectedEmployees
  const hasSelectedEmployees = Array.isArray(selectedEmployees) && selectedEmployees.length > 0;
  const hasEmployeesToRemove = Array.isArray(selectedEmpToRemove) && selectedEmpToRemove.length > 0;

  if (!hasSelectedEmployees && !hasEmployeesToRemove) {
    return res.status(400).json({ error: 'No employees to add or remove.' });
  }

  // Function to insert employees
  const insertEmployees = () => {
    return new Promise((resolve, reject) => {
      if (!hasSelectedEmployees) return resolve({ inserted: 0 });

      const insertValues = selectedEmployees.map(employeeId => [employeeId, trainingId]);
      const insertQuery = 'INSERT INTO trainingRegistration (employeeId, trainingId) VALUES ?';

      connection.query(insertQuery, [insertValues], (err, results) => {
        if (err) {
          console.error('Error inserting employees into trainings:', err);
          return reject(err);
        }
        console.log('Inserted employees into trainings:', results);
        resolve({ inserted: results.affectedRows });
      });
    });
  };

  // Function to delete employees
  const deleteEmployees = () => {
    return new Promise((resolve, reject) => {
      if (!hasEmployeesToRemove) return resolve({ deleted: 0 });

      const deleteQuery = 'DELETE FROM trainingRegistration WHERE trainingId = ? AND employeeId IN (?)';
      connection.query(deleteQuery, [trainingId, selectedEmpToRemove], (err, results) => {
        if (err) {
          console.error('Error removing employees from training:', err);
          return reject(err);
        }
        console.log('Deleted employees from training:', results);
        resolve({ deleted: results.affectedRows });
      });
    });
  };

  // Execute both operations in parallel
  Promise.all([insertEmployees(), deleteEmployees()])
    .then(([insertResults, deleteResults]) => {
      res.status(200).json({
        message: 'Employees added and/or removed from training successfully.',
        inserted: insertResults.inserted,
        deleted: deleteResults.deleted,
      });
    })
    .catch(err => {
      console.error('Error processing training updates:', err);
      res.status(500).json({
        error: 'An error occurred while processing the request.',
        details: err.message,
      });
    });
});


router.get('/get-distinct-department-employess-skill-to-train/:departmentId',(req,res)=>{
  const departmentId = req.params.departmentId;
  
  // Updated query to use employeeSkill table instead of selectedAssigntraining
  // This shows ALL employees with skills (real-time data), not just pre-assigned ones
  const query = `
    SELECT 
      es.employeeId, 
      es.skillId, 
      e.employeeName, 
      d.departmentName,
      d.departmentId, 
      s.skillName
    FROM employeeSkill es
    INNER JOIN employee e ON es.employeeId = e.employeeId
    INNER JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
    INNER JOIN department d ON d.departmentId = ed.departmentId
    INNER JOIN skill s ON es.skillId = s.skillId
    WHERE es.skillId IN (
      SELECT skillId FROM departmentSkill 
      WHERE departmentId = ? 
        AND (departmentSkillType = 1 OR departmentSkillType = 3)
        AND departmentSkillStatus = 1
    )
    ORDER BY d.departmentName, e.employeeName, s.skillName
  `;

  connection.query(query,[departmentId],(err,result) =>{
    if(err){
      console.error("Error fetching employees by department and skill:", err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    // Group results by department name
    const response = {};
    result.forEach(row =>{
      if(!response[row.departmentName]){
        response[row.departmentName]=[];
      }
      response[row.departmentName].push({
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        skillName: row.skillName,
        skillId : row.skillId,
        departmentId : row.departmentId
      })
    })
    
    console.log(`Fetched ${result.length} employee-skill records for department ${departmentId}, grouped into ${Object.keys(response).length} departments`);
    return res.json(response)

  });
})

router.get(`/get-department-needed-trainings/:departmentId`, (req, res) => {
  const departmentId = req.params.departmentId;
  const query = `
  SELECT t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, e.employeeName AS trainerName,t.trainerId ,
  GROUP_CONCAT(s.skillName SEPARATOR ', ') AS skills ,GROUP_CONCAT(s.skillId SEPARATOR ', ') AS skillIds, t.evaluationType
  FROM training t
  join trainingSkills ts on t.trainingId = ts.trainingId
  join skill s on s.skillId = ts.skillId
  join employee e on t.trainerId = e.employeeId
  where ts.skillId IN (select skillId from departmentSkill where departmentId = ? and (departmentSkillType = 2 OR departmentSkillType = 3))
  group by t.trainingId,t.trainingTitle;`

connection.query(query,[departmentId],(err,result) =>{
  if(err){
    // console.log("Fetching data from data base for seperating departments",err);
    return res.status(500).json({ error: 'Database insertion failed' });
  }
  return res.json(result)

});
});


// Select employees from employeeSkill table who are eligible for that training
// Updated to query employeeSkill directly instead of selectedAssignTraining
// This ensures newly added/updated employees appear immediately without manual intervention
router.get('/eligible-employee-to-send-to-training', (req, res) => {
  const {trainingId, departmentId} = req.query;

  if (!trainingId) {
    return res.status(400).json({ error: 'Training ID is required' });
  }
  
  if (!departmentId) {
    return res.status(400).json({ error: 'Department ID is required' });
  }

  // Query that fetches employees directly from employeeSkill table
  // This includes ALL employees in the department who have the required skills
  // regardless of whether they're in selectedAssignTraining table
  const query = `
    SELECT DISTINCT 
      es.employeeId, 
      es.skillId,
      s.skillName,
      e.employeeName,
      ed.departmentId,
      es.grade
    FROM training t
    INNER JOIN trainingSkills ts ON t.trainingId = ts.trainingId
    INNER JOIN employeeSkill es ON es.skillId = ts.skillId
    INNER JOIN skill s ON es.skillId = s.skillId
    INNER JOIN employee e ON e.employeeId = es.employeeId
    INNER JOIN employeeDesignation ed ON ed.employeeId = es.employeeId
    WHERE t.trainingId = ? 
      AND ed.departmentId = ? 
      AND es.employeeId != t.trainerId
    ORDER BY e.employeeName, s.skillName
  `;

  connection.query(query, [trainingId, departmentId], (err, result) => {
    if (err) {
      console.error("Error fetching eligible employees:", err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    console.log(`Fetched ${result.length} eligible employees for training ${trainingId} in department ${departmentId}`);
    return res.json(result);
  });
});


router.get('/department-eligible-for-training/:departmentId/:skillId?', (req, res) => {
  const departmentId = req.params.departmentId;
  const skillId = req.params.skillId;

  // SQL query to fetch training data based on the presence of skillId
  const query = skillId
    ? `
      SELECT t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate,
        GROUP_CONCAT(s.skillName SEPARATOR ', ') AS skills, e.employeeName AS trainerName, t.evaluationType
      FROM training t
      INNER JOIN trainingSkills ts ON ts.trainingId = t.trainingId
      INNER JOIN employee e ON e.employeeId = t.trainerId
      INNER JOIN skill s ON s.skillId = ts.skillId
      WHERE s.departmentId = ?
      AND ts.skillId = ?
      GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, e.employeeName;
    `
    : `
      SELECT t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate,
        GROUP_CONCAT(s.skillName SEPARATOR ', ') AS skills, e.employeeName AS trainerName, t.evaluationType
      FROM training t
      INNER JOIN trainingSkills ts ON ts.trainingId = t.trainingId
      INNER JOIN employee e ON e.employeeId = t.trainerId
      INNER JOIN skill s ON s.skillId = ts.skillId
      WHERE s.departmentId = ?
      GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, e.employeeName;
    `;

  // Execute the query based on the parameters
  const params = skillId ? [departmentId, skillId] : [departmentId];

  connection.query(query, params, (err, result) => {
    if (err) {
      console.error("Failed to fetch eligible department training", err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // Return the results as JSON
    return res.json(result);
  });
});

// Export the router
export default router;
