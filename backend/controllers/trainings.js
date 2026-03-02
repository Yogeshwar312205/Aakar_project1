import { connection } from "../db/index.js";
import express from "express";
const router = express.Router();


//add training
router.post('/add-training', (req, res) => {
  const { trainingTitle, startTrainingDate, endTrainingDate, trainerId, skills, evaluationType } = req.body;

  const query = 'INSERT INTO training (trainingTitle, startTrainingDate, endTrainingDate, trainerId, evaluationType) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [trainingTitle, startTrainingDate, endTrainingDate, trainerId, evaluationType], (err, result) => {
    if (err) {
      console.error('Error inserting training:', err);
      return res.status(500).send('Failed to insert training');
    }
    const trainingId = result.insertId;
    
    if (skills && skills.length > 0) {
      const skillQueries = skills.map(skill => {
        return new Promise((resolve, reject) => {
          const skillQuery = 'INSERT INTO trainingSkills (trainingId, skillId) VALUES (?, ?)';
          connection.query(skillQuery, [trainingId, skill.id], (err) => {  // Changed skill.id to skill
            if (err) {
              console.error('Error inserting skill:', err);
              reject(err);
            } else {
              resolve();
            }
            console.log(skill);  
          });
        });
      });
    }
    return res.status(201).json({ message: 'Training added successfully',trainingId: trainingId});
  })})
  
  
  router.get('/all-training/:departmentId', (req, res) => {
    const departmentId = req.params.departmentId;
    const query = `
      SELECT t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, e.employeeName AS trainerName, t.trainerId,
        GROUP_CONCAT(s.skillName SEPARATOR ', ') AS skills, GROUP_CONCAT(s.skillId SEPARATOR ', ') AS skillIds, t.evaluationType
      FROM training t
      LEFT JOIN employee e ON t.trainerId = e.employeeId
      LEFT JOIN trainingSkills ts ON t.trainingId = ts.trainingId
      LEFT JOIN skill s ON ts.skillId = s.skillId
      WHERE s.departmentId = ?
      GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, e.employeeName
    `;
  
    connection.query(query,[departmentId], (err, result) => {
      if (err) {
        console.error('Error fetching training data:', err);
        res.status(500).json({ error: 'Failed to fetch training data' });
      } else {
        res.json(result);
      }
    });
  });
  
  
  router.put('/update-training/:trainingId', (req, res) => {
    const trainingId = req.params.trainingId;
    const { trainingTitle, trainerId, startTrainingDate, endTrainingDate, skills, evaluationType } = req.body;
  
    if (!trainingTitle || !trainerId || !startTrainingDate || !endTrainingDate || !evaluationType) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const updateTrainingQuery = `
      UPDATE training
      SET trainingTitle = ?, trainerId = ?, startTrainingDate = ?, endTrainingDate = ?, evaluationType = ?
      WHERE trainingId = ?;
    `;
  
    connection.query(
      updateTrainingQuery,
      [trainingTitle, trainerId, startTrainingDate, endTrainingDate, evaluationType, trainingId, evaluationType],
      (err, result) => {
        if (err) {
          console.error('Error updating training:', err);
          return res.status(500).json({ message: 'Error updating training details.' });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Training not found.' });
        }
  
        if (skills && skills.length > 0) {
          const deleteSkillsQuery = 'DELETE FROM trainingSkills WHERE trainingId = ?';
          connection.query(deleteSkillsQuery, [trainingId], (err) => {
            if (err) {
              console.error('Error deleting training skills:', err);
              return res.status(500).json({ message: 'Error updating training skills.' });
            }
            const insertSkillsQuery = `
              INSERT INTO trainingSkills (trainingId, skillId) VALUES ?`;
  
            const skillValues = skills.map(skill => [trainingId, skill.id]); // Fix applied here
  
            connection.query(insertSkillsQuery, [skillValues], (err) => {
              if (err) {
                console.error('Error inserting training skills:', err);
                return res.status(500).json({ message: 'Error updating training skills.' });
              }
  
              res.status(200).json({ message: 'Training and skills updated successfully.' });
            });
          });
        } else {
          res.status(200).json({ message: 'Training updated successfully, no skills provided.' });
        }
      }
    );
  });
    
  router.delete('/delete-training/:trainingId', (req, res) => {
    const trainingId = req.params.trainingId;
  
    const deleteSkillsQuery = 'DELETE FROM trainingskills WHERE trainingId = ?';
    
    connection.query(deleteSkillsQuery, [trainingId], (err, skillResult) => {
      if (err) {
        console.error('Error deleting associated skills:', err);
        return res.status(500).send('Failed to delete associated skills');
      }
  
      const deleteSessionsQuery = 'DELETE FROM sessions WHERE trainingId = ?';
  
      connection.query(deleteSessionsQuery, [trainingId], (err, sessionResult) => {
        if (err) {
          console.error('Error deleting associated sessions:', err);
          return res.status(500).send('Failed to delete associated sessions');
        }
  
        const deleteTrainingQuery = 'DELETE FROM training WHERE trainingId = ?';
        connection.query(deleteTrainingQuery, [trainingId], (err, trainingResult) => {
          if (err) {
            console.error('Error deleting training:', err);
            return res.status(500).send('Failed to delete training');
          }
  
          res.send({ message: 'Training and associated sessions and skills deleted successfully' });
        });
      });
    });
  });

// Endpoint to fetch employees enrolled in a specific training in managerPOV
router.get('/ManagerPOV/employeesEnrolled/:trainingId', (req, res) => {
  const trainingId = req.params.trainingId;
  const query = `SELECT 
    e.employeeId, 
    e.employeeName, 
    d.departmentName, 
    s.skillName, 
    s.skillId,
    es.grade, 
    tr.trainerFeedback 
FROM 
    trainingSkills ts
    INNER JOIN skill s ON ts.skillId = s.skillId
    INNER JOIN trainingRegistration tr ON ts.trainingId = tr.trainingId
    INNER JOIN employee e ON tr.employeeId = e.employeeId
    LEFT JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
    LEFT JOIN department d ON ed.departmentId = d.departmentId
    LEFT JOIN employeeSkill es ON e.employeeId = es.employeeId AND es.skillId = s.skillId
WHERE 
    ts.trainingId = ?;
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

router.get('/departments-with-employees', (req, res) => {
  const query = `SELECT d.departmentName, e.employeeId, e.employeeName, s.skillName, es.grade
    FROM department d
    INNER JOIN  employeeDesignation ed ON d.departmentId = ed.departmentId
    INNER JOIN employee e ON ed.employeeId = e.employeeId
    INNER JOIN selectedAssignTraining sa ON e.employeeId = sa.employeeId
    INNER JOIN  skill s ON sa.skillId = s.skillId
    INNER JOIN  employeeSkill es ON sa.employeeId = es.employeeId AND sa.skillId = es.skillId
    ORDER BY  d.departmentId, e.employeeId;`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      return res.status(500).json({ message: 'Error retrieving data', error: err });
    }
    // Group results by department name
    const response = {};
    results.forEach(row => {
      if (!response[row.departmentName]) {
        response[row.departmentName] = [];
      }
      // Add employee data to the department
      response[row.departmentName].push({
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        skillName: row.skillName,
        grade: row.grade
      });
    });
    res.json(response);
  });
});

// Export the router
export default router;