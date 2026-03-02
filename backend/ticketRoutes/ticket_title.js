import express from 'express';
const router = express.Router();
import db from '../config.js';


// GET all ticket titles with issue type details
router.get('/ticket_titles', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT tt.id, tt.title, it.issue AS issue_type
      FROM ticket_title tt
      JOIN issue_type it ON tt.issue_type_id = it.id
    `);
    res.json(results);
  } catch (err) {
    console.error('Error fetching ticket titles:', err);
    res.status(500).send('Server error');
  }
});

// POST a new ticket title using the issue name
router.post('/ticket_titles', async (req, res) => {
  const { issue, title } = req.body;
  
  if (!issue || !title) {
    return res.status(400).send('Issue and title are required');
  }

  try {
    // Get the issue_type_id for the given issue
    const [issueTypeResult] = await db.query(`
      SELECT id FROM issue_type WHERE issue = ?
    `, [issue]);

    if (issueTypeResult.length === 0) {
      return res.status(400).send(`Issue type not found for issue: ${issue}`);
    }

    const issue_type_id = issueTypeResult[0].id;

    // Insert the ticket title with the found issue_type_id
    const [results] = await db.query(`
      INSERT INTO ticket_title (issue_type_id, title)
      VALUES (?, ?)
    `, [issue_type_id, title]);

    res.status(201).json({ id: results.insertId, issue_type_id, title });
  } catch (err) {
    console.error('Error creating ticket title:', err);
    res.status(500).send('Server error');
  }
});

// PUT update an existing ticket title using the issue name
router.put('/ticket_titles/:id', async (req, res) => {
  const titleId = req.params.id;
  const { issue, title } = req.body;

  if (!issue || !title) {
    return res.status(400).send('Issue and title are required');
  }

  try {
    // Get the issue_type_id for the given issue
    const [issueTypeResult] = await db.query(`
      SELECT id FROM issue_type WHERE issue = ?
    `, [issue]);

    if (issueTypeResult.length === 0) {
      return res.status(400).send(`Issue type not found for issue: ${issue}`);
    }

    const issue_type_id = issueTypeResult[0].id;

    // Update the ticket title with the found issue_type_id
    const [results] = await db.query(`
      UPDATE ticket_title
      SET issue_type_id = ?, title = ?
      WHERE id = ?
    `, [issue_type_id, title, titleId]);

    if (results.affectedRows === 0) {
      return res.status(404).send('Ticket title not found');
    }

    res.status(200).json({ id: titleId, issue_type_id, title });
  } catch (err) {
    console.error('Error updating ticket title:', err);
    res.status(500).send('Server error');
  }
});

// DELETE an existing ticket title
router.delete('/ticket_titles/:id', async (req, res) => {
  const titleId = req.params.id;

  try {
    // Delete the ticket title by ID
    const [results] = await db.query(`
      DELETE FROM ticket_title
      WHERE id = ?
    `, [titleId]);

    if (results.affectedRows === 0) {
      return res.status(404).send('Ticket title not found');
    }

    res.status(204).send(); // No content
  } catch (err) {
    console.error('Error deleting ticket title:', err);
    res.status(500).send('Server error');
  }
});





// GET a specific ticket title by ID
router.get('/ticket_titles/:id', async (req, res) => {
  const ticketTitleId = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM ticket_title WHERE id = ?', [ticketTitleId]);
    if (results.length === 0) {
      res.status(404).send('Ticket title not found');
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching ticket title:', err);
    res.status(500).send('Server error');
  }
});

// GET ticket titles by issue type ID
router.get('/ticket_titles/issue_type/:issueTypeId', async (req, res) => {
  const issueTypeId = req.params.issueTypeId;
  try {
    const [results] = await db.query('SELECT * FROM ticket_title WHERE issue_type_id = ?', [issueTypeId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching ticket titles by issue type:', err);
    res.status(500).send('Server error');
  }
});


// GET a specific ticket title by title (not by ID)
router.get('/ticket_titles/details_by_title/:title', async (req, res) => {
    const ticketTitle = req.params.title;
  
    try {
      // Query to get the issue type and department based on the ticket title
      const query = `
        SELECT
          tt.id,
          tt.title,
          it.issue AS issue_type,
          d.departmentName AS department
        FROM
          ticket_title tt
          JOIN issue_type it ON tt.issue_type_id = it.id
          JOIN department d ON it.department_id = d.departmentId
        WHERE
          tt.title = ?
      `;
  
      const [results] = await db.query(query, [ticketTitle]);
  
      if (results.length === 0) {
        res.status(404).send('Ticket title not found');
        return;
      }
  
      res.json(results[0]);
    } catch (err) {
      console.error('Error fetching issue type and department for the ticket title:', err);
      res.status(500).send('Server error');
    }
  });


  
  // GET all basic solutions for a specific ticket title (by title)
  router.get('/ticket_titles/solutions_by_title/:title', async (req, res) => {
    const ticketTitle = req.params.title;
  
    try {
      // First, fetch the issue_type_id from the ticket_title using the title
      const [ticketTitleResults] = await db.query(
        'SELECT issue_type_id FROM ticket_title WHERE title = ?', 
        [ticketTitle]
      );
      
      // Check if the ticket title exists
      if (ticketTitleResults.length === 0) {
        return res.status(404).json({ message: 'Ticket title not found' });
      }
  
      const issueTypeId = ticketTitleResults[0].issue_type_id;
  
      // Fetch the basic solutions based on the issue_type_id
      const [solutions] = await db.query(
        'SELECT solution FROM basic_solution WHERE issue_type_id = ?', 
        [issueTypeId]
      );
  
      // Check if any solutions exist for the given issue type
      if (solutions.length === 0) {
        return res.status(404).json({ message: 'No solutions found for the given ticket title' });
      }
  
      // Return the list of solutions as a response
      res.json(solutions);
    } catch (err) {
      console.error('Error fetching basic solutions:', err);
      res.status(500).json({ message: 'Server error' });
    }
});

export default router;

