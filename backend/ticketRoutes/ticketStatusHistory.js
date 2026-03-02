import express from 'express';
const router = express.Router();
import db from '../config.js';


// GET status history for a specific ticket ID
router.get('/status-history/:ticketId', async (req, res) => {
    const ticketId = req.params.ticketId;

    try {
        // Query to fetch status history, ordered by changed_at descending
        const query = `
            SELECT 
                tsh.id AS history_id,
                tsh.ticket_id,
                tsh.changed_by,
                e.employeeName AS changed_by_name,
                tsh.old_status,
                tsh.new_status,
                tsh.status_change_reason,
                tsh.email_sent_to_owner,
                tsh.email_sent_to_manager,   
                tsh.changed_at
            FROM 
                ticket_status_history tsh
            JOIN 
                employee e ON tsh.changed_by = e.employeeId
            WHERE 
                tsh.ticket_id = ?
            ORDER BY 
                tsh.changed_at DESC
        `;
        const [results] = await db.query(query, [ticketId]);

        if (results.length === 0) {
            res.status(404).json({ message: 'No status history found for this ticket ID' });
        } else {
            res.json(results);
        }
    } catch (err) {
        console.error('Error fetching status history:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT route to add a new status change record
router.put('/status-history', async (req, res) => {
    const { ticket_id, changed_by, old_status, new_status, status_change_reason, email_sent_to_owner, email_sent_to_manager } = req.body;

    try {
        // Insert a new status change record into the database
        const query = `
            INSERT INTO ticket_status_history (
                ticket_id,
                changed_by,
                old_status,
                new_status,
                status_change_reason,
                email_sent_to_owner,
                email_sent_to_manager,
                changed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const [result] = await db.query(query, [
            ticket_id,
            changed_by,
            old_status,
            new_status,
            status_change_reason,
            email_sent_to_owner,
            email_sent_to_manager
        ]);

        res.status(201).json({ message: 'Status history added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error adding status history:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;

