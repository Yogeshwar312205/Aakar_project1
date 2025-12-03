import express from 'express';
const router = express.Router();
import db from '../config.js';


// GET all entries from sendMailTo
router.get('/sendMailTo', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT id, event, sendTo
      FROM sendMailTo
    `);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching sendMailTo:', err);
    res.status(500).json({ success: false, message: 'Error fetching data', error: err.message });
  }
});

// GET a specific entry by ID
router.get('/sendMailTo/:id', async (req, res) => {
  const entryId = req.params.id;
  try {
    const [results] = await db.query(`
      SELECT id, event, sendTo
      FROM sendMailTo
      WHERE id = ?
    `, [entryId]);

    if (results.length === 0) {
      res.status(404).json({ success: false, message: 'Entry not found' });
      return;
    }
    res.status(200).json({ success: true, data: results[0] });
  } catch (err) {
    console.error('Error fetching entry:', err);
    res.status(500).json({ success: false, message: 'Error fetching entry', error: err.message });
  }
});

// POST a new entry
router.post('/sendMailTo', async (req, res) => {
  const { event, sendTo } = req.body;
  
  if (!event || !sendTo) {
    res.status(400).json({ success: false, message: 'Event and sendTo are required' });
    return;
  }

  try {
    const [results] = await db.query(`
      INSERT INTO sendMailTo (event, sendTo)
      VALUES (?, ?)
    `, [event, sendTo]);

    res.status(201).json({ success: true, data: { id: results.insertId, event, sendTo } });
  } catch (err) {
    console.error('Error creating entry:', err);
    res.status(500).json({ success: false, message: 'Error creating entry', error: err.message });
  }
});

// PUT update an existing entry
router.put('/sendMailTo/:id', async (req, res) => {
  const entryId = req.params.id;
  const { event, sendTo } = req.body;

  if (!event || !sendTo) {
    res.status(400).json({ success: false, message: 'Event and sendTo are required' });
    return;
  }

  try {
    const [results] = await db.query(`
      UPDATE sendMailTo
      SET event = ?, sendTo = ?
      WHERE id = ?
    `, [event, sendTo, entryId]);

    if (results.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Entry not found' });
      return;
    }

    res.status(200).json({ success: true, data: { id: entryId, event, sendTo } });
  } catch (err) {
    console.error('Error updating entry:', err);
    res.status(500).json({ success: false, message: 'Error updating entry', error: err.message });
  }
});

// DELETE an entry
router.delete('/sendMailTo/:id', async (req, res) => {
  const entryId = req.params.id;
  try {
    const [results] = await db.query(`
      DELETE FROM sendMailTo WHERE id = ?
    `, [entryId]);

    if (results.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Entry not found' });
      return;
    }

    res.status(204).send(); // No content status
  } catch (err) {
    console.error('Error deleting entry:', err);
    res.status(500).json({ success: false, message: 'Error deleting entry', error: err.message });
  }
});

export default router;

