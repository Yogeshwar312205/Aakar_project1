import express from 'express';
const router = express.Router();

import db from '../config.js';

// GET all basic solutions with issue type details
router.get('/basic_solutions', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT bs.id, bs.solution, it.issue AS issue_type
      FROM basic_solution bs
      JOIN issue_type it ON bs.issue_type_id = it.id
    `);
    res.json(results);
  } catch (err) {
    console.error('Error fetching basic solutions:', err);
    res.status(500).send('Server error');
  }
});

// GET a specific basic solution by ID
router.get('/basic_solutions/:id', async (req, res) => {
  const solutionId = req.params.id;
  try {
    const [results] = await db.query(`
      SELECT bs.id, bs.solution, it.issue AS issue_type
      FROM basic_solution bs
      JOIN issue_type it ON bs.issue_type_id = it.id
      WHERE bs.id = ?
    `, [solutionId]);
    if (results.length === 0) {
      res.status(404).send('Basic solution not found');
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching basic solution:', err);
    res.status(500).send('Server error');
  }
});

// POST a new basic solution
router.post('/basic_solutions', async (req, res) => {
  const { issue, solution } = req.body;
  if (!issue || !solution) {
    res.status(400).send('Issue and solution are required');
    return;
  }

  try {
    // Step 1: Get the issue_type_id for the given issue
    const [issueTypeResult] = await db.query(`
      SELECT id FROM issue_type WHERE issue = ?
    `, [issue]);

    if (issueTypeResult.length === 0) {
      res.status(400).send(`Issue type not found for issue: ${issue}`);
      return;
    }

    const issue_type_id = issueTypeResult[0].id;

    // Step 2: Insert the basic solution with the found issue_type_id
    const [results] = await db.query(`
      INSERT INTO basic_solution (issue_type_id, solution)
      VALUES (?, ?)
    `, [issue_type_id, solution]);

    res.status(201).json({ id: results.insertId, issue_type_id, solution });
  } catch (err) {
    console.error('Error creating basic solution:', err);
    res.status(500).send('Server error');
  }
});

// PUT update an existing basic solution
router.put('/basic_solutions/:id', async (req, res) => {
  const solutionId = req.params.id;
  const { issue, solution } = req.body;

  if (!issue || !solution) {
    res.status(400).send('Issue and solution are required');
    return;
  }

  try {
    // Step 1: Get the issue_type_id for the given issue
    const [issueTypeResult] = await db.query(`
      SELECT id FROM issue_type WHERE issue = ?
    `, [issue]);

    if (issueTypeResult.length === 0) {
      res.status(400).send(`Issue type not found for issue: ${issue}`);
      return;
    }

    const issue_type_id = issueTypeResult[0].id;

    // Step 2: Update the basic solution with the found issue_type_id
    const [results] = await db.query(`
      UPDATE basic_solution
      SET issue_type_id = ?, solution = ?
      WHERE id = ?
    `, [issue_type_id, solution, solutionId]);

    if (results.affectedRows === 0) {
      res.status(404).send('Basic solution not found');
      return;
    }
    res.json({ id: solutionId, issue_type_id, solution });
  } catch (err) {
    console.error('Error updating basic solution:', err);
    res.status(500).send('Server error');
  }
});


// DELETE a basic solution
router.delete('/basic_solutions/:id', async (req, res) => {
  const solutionId = req.params.id;
  try {
    const [results] = await db.query(`
      DELETE FROM basic_solution WHERE id = ?
    `, [solutionId]);
    if (results.affectedRows === 0) {
      res.status(404).send('Basic solution not found');
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting basic solution:', err);
    res.status(500).send('Server error');
  }
});

export default router;

