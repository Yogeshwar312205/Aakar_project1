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
      let finalQuery = '';
      let queryParams = [];
  
      if (type3Skills.length > 0) {
        const placeholdersSkill = type3Skills.map(() => '?').join(',');
        finalQuery = `
          SELECT DISTINCT ed.employeeId, e.employeeName
          FROM employee e
          INNER JOIN employeeSkill es ON e.employeeId = es.employeeId
          JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
          WHERE es.skillId IN (${placeholdersSkill})
            AND es.grade = 4
            AND ed.departmentId = ? group by ed.employeeId
            having count (DISTINCT es.skillId) = ${type3Skills.length}
        `;
        queryParams = [...type3Skills, departmentId];
      } else if (type1Skills.length > 0) {
        finalQuery = `
          SELECT DISTINCT e.employeeId, e.employeeName
          FROM employee e
          JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
          WHERE ed.departmentId = ?
        `;
        queryParams = [departmentId];
      } else {
        return res.status(404).json({ error: 'No matching employees found' });
      }
  
      // Execute the final query
      connection.query(finalQuery, queryParams, (err, employees) => {
        if (err) {
          console.error('Error fetching employees:', err);
          return res.status(500).json({ error: 'Error fetching employees' });
        }
  
        return res.status(200).json(employees);
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
router.get(`/DepartmentGiveTskills/:dept_id`,(req,res)=>{
  const deptId = req.params.dept_id;
  const query = `SELECT s.skillName,ds.skillId
FROM departmentSkill ds
JOIN skill s ON ds.skillId = s.skillId
WHERE ds.departmentId = ?
  AND ds.departmentSkillType IN (1, 3) AND s.skillActivityStatus = 1;
; `
  connection.query(query,[deptId],(err,result)=>{
    if(err){
      console.error('Error in fetching Skill Training by Departmment', err);
        return res.status(500).json({ error: 'Error fetching data' });
    }
    res.json(result);
    // console.log('DepartmentId',result);
  })
})

// router.post('/send-multiple-emps-to-trainings', (req, res) => {
//   const { trainingId, selectedEmployees, selectedEmpToRemove } = req.body;

//   if (!trainingId || !selectedEmployees || !selectedEmployees.length) {
//     return res.status(400).json({ error: 'Missing trainingId or selectedEmployees' });
//   }

//   // Query 1: Insert employees into training
//   const insertValues = selectedEmployees.map(employeeId => [employeeId, trainingId]);
//   const insertQuery = 'INSERT INTO trainingRegistration (employeeId, trainingId) VALUES ?';

//   connection.query(insertQuery, [insertValues], (insertErr, insertResults) => {
//     if (insertErr) {
//       console.error('Error inserting employees into trainings:', insertErr);
//       return res.status(500).json({ error: 'Failed to add employees to training.' });
//     }

//     console.log('Inserted employees into trainings:', insertResults);

//     // Proceed with deletion only if employees to remove exist
//     if (Array.isArray(selectedEmpToRemove) && selectedEmpToRemove.length > 0) {
//       // Query 2: Delete employees from training
//       console.log("Remove emps : ",selectedEmpToRemove)
//       const deleteQuery = `DELETE FROM trainingRegistration WHERE trainingId = ? AND employeeId IN (?)`;
//       connection.query(deleteQuery, [trainingId, selectedEmpToRemove], (deleteErr, deleteResults) => {
//         if (deleteErr) {
//           console.error('Error removing employees from training:', deleteErr);
//           return res.status(500).json({
//             message: 'Employees were added, but some could not be removed.',
//             error: deleteErr.message,
//             inserted: insertResults.affectedRows,
//           });
//         }

//         console.log('Deleted employees from training:', deleteResults);
//         return res.status(200).json({
//           message: 'Employees added and removed from training successfully.',
//           inserted: insertResults.affectedRows,
//           deleted: deleteResults.affectedRows,
//         });
//       });
//     } else {
//       // No deletion needed, respond with success for insertion
//       return res.status(200).json({
//         message: 'Employees added to training successfully.',
//         inserted: insertResults.affectedRows,
//       });
//     }
//   });
// });

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
  const a = req.params.departmentId;
  const query = `
    select sa.employeeId , sa.skillId , e.employeeName , d.departmentName ,d.departmentId, s.skillName from selectedAssigntraining sa 
    inner join employee e on sa.employeeId = e.employeeId
    inner join employeeDesignation ed on e.employeeId = ed.employeeId
    inner join department d on d.departmentId = ed.departmentId
    inner join skill s on sa.skillId = s.skillId
    where sa.skillId in (select skillId from departmentSkill where departmentId = ? and (departmentSkillType = 1 OR departmentSkillType = 3));`

  connection.query(query,[a],(err,result) =>{
    if(err){
      // console.log("Fetching data from data base for seperating departments",err);
      return res.status(500).json({ error: 'Database insertion failed' });
    }
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
        
        //grade: row.grade
      })
      // console.log("hi", response)
    })
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


// Select employess from selected assign table who are elidgible for that training
router.get('/eligible-employee-to-send-to-training', (req, res) => {
  const {trainingId,departmentId} = req.query;

  if (!trainingId) {
    return res.status(400).json({ error: 'Training ID is required' });
  }
  const query = `SELECT sa.employeeId, sa.skillId,s.skillName,e.employeeName,ed.departmentId
  FROM training t
  INNER JOIN trainingSkills ts ON t.trainingId = ts.trainingId
  INNER JOIN selectedAssigntraining sa ON sa.skillId = ts.skillId
  INNER JOIN skill s ON sa.skillId = s.skillId
  INNER JOIN employeeDesignation ed on ed.employeeId = sa.employeeId
  INNER JOIN employee e ON e.employeeId = sa.employeeId
  WHERE t.trainingId = ? and ed.departmentId = ?`;

  connection.query(query, [trainingId,departmentId], (err, result) => {
    if (err) {
      console.error("Error fetching eligible employees:", err);
      return res.status(500).json({ error: 'Database query failed' });
    }
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