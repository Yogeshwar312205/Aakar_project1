import express from 'express';
const router = express.Router();
import db from '../config.js';

// GET all departments
router.get('/departments', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM department');
    console.log(results);
    res.json(results);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).send('Server error');
  }
});

// GET a specific department by ID
router.get('/departments/:id', (req, res) => {
  const departmentId = req.params.id;
  const query = 'SELECT * FROM department WHERE departmentId = ?';
  db.query(query, [departmentId], (err, results) => {
    if (err) {
      console.error('Error fetching department:', err);
      res.status(500).send('Server error');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Department not found');
      return;
    }
    res.json(results[0]);
  });
});

// GET a specific department by name
router.get('/departments/name/:name', (req, res) => {
  const departmentName = req.params.name;
  const query = 'SELECT * FROM department WHERE departmentName = ?';
  db.query(query, [departmentName], (err, results) => {
    if (err) {
      console.error('Error fetching department:', err);
      res.status(500).send('Server error');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Department not found');
      return;
    }
    res.json(results);
  });
});


export default router;
