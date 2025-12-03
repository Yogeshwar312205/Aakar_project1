import express from 'express';
const router = express.Router();
import db from '../config.js';


// GET assignee history for a specific ticket ID with assignee names and change details
router.get('/assignee-history/:id', async (req, res) => {
    const ticketId = req.params.id;

    try {
        // Updated query to fetch assignee history with the new structure
        const query = `
            SELECT 
                tah.id AS history_id,
                tah.ticket_id,
                tah.changed_by,
                changer.employeeName AS changed_by_name,
                tah.old_assignee AS old_assignee_name,  -- Now a VARCHAR field
                tah.new_assignee AS new_assignee_name,  -- Now a VARCHAR field
                tah.change_reason,
                tah.assigned_at,
                tah.email_sent_to_owner,
                tah.email_sent_to_manager
            FROM 
                ticket_assignee_history tah
            LEFT JOIN 
                employee changer ON tah.changed_by = changer.employeeId
            WHERE 
                tah.ticket_id = ?
            ORDER BY 
                tah.assigned_at DESC
        `;
        const [results] = await db.query(query, [ticketId]);

        if (results.length === 0) {
            res.status(404).json({ message: 'No assignee history found for this ticket ID' });
        } else {
            res.json(results);
        }
    } catch (err) {
        console.error('Error fetching assignee history:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// POST route to create a new assignee history entry
router.post('/assignee-history', async (req, res) => {
    const { ticket_id, changed_by, old_assignee, new_assignee, change_reason, email_sent_to_owner, email_sent_to_manager } = req.body;

    try {
        // Insert query for the updated table structure
        const query = `
            INSERT INTO ticket_assignee_history 
            (ticket_id, changed_by, old_assignee, new_assignee, change_reason, email_sent_to_owner, email_sent_to_manager) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [ticket_id, changed_by, old_assignee, new_assignee, change_reason, email_sent_to_owner, email_sent_to_manager]);
        console.log(result);
        res.status(201).json({ message: 'Assignee history entry created successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating assignee history entry:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
