import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

// Import route modules using ES module syntax (all with `import`)
import attendanceRoutes from '../controllers/attendance.js'
import departmentRoutes from '../controllers/departments.js'
import employeeRoutes from '../controllers/employees.js'
import gradeRoutes from '../controllers/grade.js'
import managerGiveTrainingRoutes from '../controllers/managerGiveTraining.js'
import managerHomeRoutes from '../controllers/managerHome.js'
import sessionRoutes from '../controllers/sessions.js'
import skillRoutes from '../controllers/skills.js'
import trainerRoutes from '../controllers/trainer.js'
import trainingRoutes from '../controllers/trainings.js'
import updateSkillRoutes from '../controllers/updateSkill.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

// Use route modules
app.use(attendanceRoutes)
app.use(departmentRoutes)
app.use(employeeRoutes)
app.use(gradeRoutes)
app.use(managerGiveTrainingRoutes)
app.use(managerHomeRoutes)
app.use(sessionRoutes)
app.use(skillRoutes)
app.use(trainerRoutes)
app.use(trainingRoutes)
app.use(updateSkillRoutes)

export default app

// app.get('/get-skills-by-department/:departmentId', (req, res) => {
//   const departmentId = req.params.departmentId;

//   const query = `
//     SELECT skillId, skillName
//     FROM skill
//     WHERE departmentId = ?`;

//   connection.query(query, [departmentId], (err, results) => {
//     if (err) {
//       console.error('Error fetching skills:', err);
//       return res.status(500).json({ error: 'Server error' });
//     }

//     // Return skills in the desired format, ensuring it has skillName
//     const skills = results.map(skill => ({
//       id: skill.skillId,
//       label: skill.skillName, // If your autocomplete expects a 'label' property
//     }));

//     res.json({ skills }); // Ensure the response is an object with 'skills' property
//   });
// });

// app.get('/api/skills', async (req, res) => {
//   try {
//     const { departmentId } = req.query;

//     let query = 'SELECT * FROM skills';
//     let values = [];

//     if (departmentId) {
//       query += ' WHERE departmentId = $1 OR departmentName = $2';
//       values = [departmentId, 'Common'];
//     }

//     const result = await pool.query(query, values);

//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching skills:', error);
//     res.status(500).json({ error: 'An error occurred while fetching skills' });
//   }
// });

// app.get('/department-eligible-for-training/:departmentId/:skillId', (req, res) => {
//   const departmentId = req.params.departmentId;
//   const skillId = req.params.skillId;

//   // SQL query to get all trainings for the department, with at least one selected skill
//   const query = `
//     SELECT t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate,
//       GROUP_CONCAT(s.skillName SEPARATOR ', ') AS skills, e.employeeName AS trainerName
//     FROM training t
//     INNER JOIN trainingSkills ts ON ts.trainingId = t.trainingId
//     INNER JOIN employee e ON e.employeeId = t.trainerId
//     INNER JOIN skill s ON s.skillId = ts.skillId
//     WHERE s.departmentId = ?  -- Filter by departmentId
//     AND EXISTS (  -- Ensures the training has at least one of the selected skills
//       SELECT 1
//       FROM trainingSkills ts2
//       INNER JOIN skill s2 ON s2.skillId = ts2.skillId
//       WHERE ts2.trainingId = t.trainingId
//       AND s2.skillId = ?  -- Filter by the skillId passed in the request
//     )
//     GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, e.employeeName;
//   `;

//   // Execute the query with the departmentId and skillId
//   connection.query(query, [departmentId, skillId], (err, result) => {
//     if (err) {
//       console.error("Failed to fetch eligible department training", err);
//       return res.status(500).json({ error: 'Database query failed' });
//     }

//     // Return the results as JSON
//     return res.json(result);
//   });
// });

// // Trainings where we can send an employees
// app.get('/department-eligible-for-training/:departmentId',(req,res)=>{
//   const departmentID = req.params.departmentId;
//   const query = `SELECT t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate,
//     GROUP_CONCAT(s.skillName SEPARATOR ', ') AS skills, e.employeeName as trainerName
//     FROM training t
//     INNER JOIN trainingSkills ts ON ts.trainingId = t.trainingId
//     INNER JOIN employee e on e.employeeId = t.trainerId
//     INNER JOIN skill s ON s.skillId = ts.skillId
//     WHERE s.departmentId = ?
//     GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate;`

//   connection.query(query,[departmentID],(err,result)=>{
//     if(err){
//       console.error("Failed to fetch eligible department training")
//       return res.status(500).json({ error: 'Database query failed' });
//     }
//     return res.json(result);
//   })
// });
