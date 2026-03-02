import express from 'express';
const router = express.Router();
import db from '../config.js';


// GET all issue types with department name
router.get('/issue_types', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT issue_type.id, department.departmentName AS department_name, issue_type.issue 
      FROM issue_type 
      LEFT JOIN department ON issue_type.department_id = department.departmentId
    `);
    res.json(results);
  } catch (err) {
    console.error('Error fetching issue types:', err);
    res.status(500).send('Server error');
  }
});

// GET a specific issue type by ID with department name
router.get('/issue_types/:id', async (req, res) => {
  const issueTypeId = req.params.id;
  try {
    const [results] = await db.query(`
      SELECT issue_type.id, department.departmentName AS department_name, issue_type.issue 
      FROM issue_type 
      LEFT JOIN department ON issue_type.department_id = department.departmentId
      WHERE issue_type.id = ?
    `, [issueTypeId]);
    if (results.length === 0) {
      res.status(404).send('Issue type not found');
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching issue type:', err);
    res.status(500).send('Server error');
  }
});

// GET a specific issue type by name with department name
router.get('/issue_types/name/:name', async (req, res) => {
  const issueName = req.params.name;
  try {
    const [results] = await db.query(`
      SELECT issue_type.id, department.departmentName AS department_name, issue_type.issue 
      FROM issue_type 
      LEFT JOIN department ON issue_type.department_id = department.departmentId
      WHERE issue_type.issue = ?
    `, [issueName]);
    if (results.length === 0) {
      res.status(404).send('Issue type not found');
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching issue type by name:', err);
    res.status(500).send('Server error');
  }
});

// POST a new issue type
router.post('/issue_types', async (req, res) => {
  const { department_name, issue } = req.body;
  if (!department_name || !issue) {
    res.status(400).send('Department name and issue are required');
    return;
  }

  try {
    // Get department ID by name
    const [departmentResult] = await db.query('SELECT departmentId FROM department WHERE departmentName = ?', [department_name]);
    if (departmentResult.length === 0) {
      res.status(404).send('Department not found');
      return;
    }
    const department_id = departmentResult[0].departmentId;
    

    // Insert issue type
    const [results] = await db.query('INSERT INTO issue_type (department_id, issue) VALUES (?, ?)', [department_id, issue]);
    res.status(201).json({ id: results.insertId, department_name, issue });
  } catch (err) {
    console.error('Error creating issue type:', err);
    res.status(500).send('Server error');
  }
});

// PUT update an existing issue type
router.put('/issue_types/:id', async (req, res) => {
  const issueTypeId = req.params.id;
  const { department_name, issue } = req.body;

  if (!department_name || !issue) {
    res.status(400).send('Department name and issue are required');
    return;
  }

  try {
    // Get department ID by name
    const [departmentResult] = await db.query('SELECT departmentId FROM department WHERE departmentName = ?', [department_name]);
    if (departmentResult.length === 0) {
      res.status(404).send('Department not found');
      return;
    }
    const department_id = departmentResult[0].id;

    // Update issue type
    const [results] = await db.query('UPDATE issue_type SET department_id = ?, issue = ? WHERE id = ?', [department_id, issue, issueTypeId]);
    if (results.affectedRows === 0) {
      res.status(404).send('Issue type not found');
      return;
    }
    res.json({ id: issueTypeId, department_name, issue });
  } catch (err) {
    console.error('Error updating issue type:', err);
    res.status(500).send('Server error');
  }
});

// DELETE an issue type
router.delete('/issue_types/:id', async (req, res) => {
  const issueTypeId = req.params.id;
  try {
    const [results] = await db.query('DELETE FROM issue_type WHERE id = ?', [issueTypeId]);
    if (results.affectedRows === 0) {
      res.status(404).send('Issue type not found');
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting issue type:', err);
    res.status(500).send('Server error');
  }
});

export default router;

