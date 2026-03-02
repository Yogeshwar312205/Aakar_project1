import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


router.post('/fetch-data', (req, res) => {
    const { skillIds, departmentId } = req.body;
  
    // Create placeholders for each skillId
    const placeholders = skillIds.map(() => '?').join(',');
  
    const query = `
      SELECT 
		ed.departmentId,
        ed.employeeId, 
        e.employeeName, 
        es.skillId, 
        es.grade, 
        s.skillName, e.employeeQualification, e.experienceInYears
      FROM 
      employeedesignation ed
        
      LEFT JOIN 
        employeeSkill es ON ed.employeeId = es.employeeId
      LEFT JOIN 
         employee e ON ed.employeeId = e.employeeId
      LEFT JOIN 
        skill s ON es.skillId = s.skillId
      WHERE 
         ed.departmentId = ?;
    `;
  
    // Spread the skillIds array and append departmentId
    connection.query(query, [departmentId], (err, result) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ error: 'Failed to fetch data' });
      }
      res.send(result);
    });
  });

// check box and grade
router.get('/get-assign-data', (req, res) => {
    const query = 'SELECT employeeId, skillId FROM selectedAssignTraining';
    
    connection.query(query, (err, result) => {
      if (err) {
        console.error('Error getting assignment data:', err);
        return res.status(500).json({ message: 'Error retrieving data', error: err });
      }
      res.send(result);
    });
  });
  
  
  router.post('/assign-training' , (req,res)=>{
    const {employeeId, employeeName, skillName, skillId, grade} = req.body;
    const query =  
    `INSERT INTO assignTraining (employeeId, employeeName, skillName, skillId, grade) VALUES (?, ?, ?, ?, ?)`;
  
    connection.query(query, [employeeId, employeeName, skillName, skillId, grade], (err, result) => {
      if (err) {
        console.error('Error assigning training:', err);
        return res.status(500).send('Failed to assign training');
      }
      res.send({message: 'Data inserted into assign_training successfully'});
    });
  });
  
  
  router.post("/deassign-training", (req, res) => {
    const { employeeId, skillId } = req.body;
    const query =
    `DELETE FROM assignTraining WHERE employeeId = ? AND skillId = ?`;
  
    connection.query(query, [employeeId, skillId], (err, result) => {
      if (err) {
        console.error('Error deassigning training:', err);
        return res.status(500).send('Failed to deassign training');
      }
      res.send({message: 'Data deleted from assign_training successfully'});
    });
  });
  
  
  router.post("/check-assign_training", (req, res) => {
    const { employeeId, skillId } = req.body;
    const query = `
      SELECT 1 
      FROM assignTraining 
      WHERE employeeId = ? AND skillId = ? 
      LIMIT 1`;
  
    connection.query(query, [employeeId, skillId], (err, result) => {
      if (err) {
        console.error('Error checking training status:', err);
        return res.status(500).send('Failed to check training status');
      }
      if (result.length > 0) {
        res.send({ exists: true });
      } else {
        res.send({ exists: false });
      }
    });
  });

// Endpoint to handle bulk updates and deletions
router.post('/update-bulk', (req, res) => {
    const { newSelectedEmp, removeEmp, grades } = req.body;
    // console.log(newSelectedEmp, removeEmp, grades)
  
    if (!Array.isArray(newSelectedEmp) || !Array.isArray(removeEmp) || !Array.isArray(grades)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
  
    // Begin transaction
    connection.beginTransaction(err => {
      if (err) {
        return res.status(500).json({ message: 'Transaction error', error: err });
      }
  
      // Handle deletions
      if (removeEmp.length > 0) {
        const deleteQuery = 'DELETE FROM selectedAssignTraining WHERE employeeId = ? AND skillId = ?';
        removeEmp.forEach(item => {
          connection.query(deleteQuery, [item.employeeId, item.skillId], (err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ message: 'Delete error', error: err });
              });
            }
          });
        });
      }
  
      // Handle new assignments
      if (newSelectedEmp.length > 0) {
        const insertQuery = 'INSERT INTO selectedAssignTraining (employeeId, skillId) VALUES (?, ?)';
        newSelectedEmp.forEach(item => {
          connection.query(insertQuery, [item.employeeId, item.skillId], (err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ message: 'Insert error', error: err });
              });
            }
          });
        });
      }
  
      // Handle grade updates
      if (grades.length > 0) {
        const updateQuery = `
          INSERT INTO employeeSkill (employeeId, skillId, grade) 
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE grade = VALUES(grade)
        `;
        grades.forEach(({ employeeId, skillId, grade }) => {
          connection.query(updateQuery, [employeeId, skillId, grade], (err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ message: 'Grade update error', error: err });
              });
            }
          });
        });
      }
  
      // Commit transaction
      connection.commit(err => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).json({ message: 'Commit error', error: err });
          });
        }
        res.status(200).json({ message: 'Bulk update successful' });
      });
    });
  });

// Auto-fetching emp data
router.get('/alreadyAssignedEmp',(req,res)=>{
    const query = `
    select e.employeeId,e.employeeName,st.skillId,s.skillName,es.grade
    from  selectedAssignTraining st 
    join employee e on st.employeeId = e.employeeId
    join skill s on st.skillId = s.skillId
    join employeeSkill es on st.employeeId = es.employeeId and st.skillId = es.skillId;`;
    
    connection.query(query,(err,result)=>{
      if(err){
        return res.status(500).json({error:'Errors fetching aleardy assigned training emp'});
      }
      res.send(result);
    })
  })
  
  
  router.get('/DeptGiveTraining',(req,res)=>{
    const query = 'SELECT * FROM selectedAssignTraining';
    connection.query(query,(err,result)=>{
      if(err){
        return res.status(500).json({error:'Errors fetching aleardy assigned training emp'});
      }
      res.send(result);
    })
  })

  // Export the router
export default router;