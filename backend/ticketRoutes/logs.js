import express from 'express';
const router = express.Router();
import db from '../config.js';
import getEmailsForTicket from './mails.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';    
import sendMail from './mailservice.js';
import { fileURLToPath } from 'url';

// Replicate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './ticketRoutes/uploads');  // Relative path from server root
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});


const upload = multer({ storage });

// GET all logs
router.get('/logs', async (req, res) => {
    try {
        const query = 'SELECT * FROM logs';
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET logs by ticket ID with attachments
router.get('/logs/ticket/:ticket_id', async (req, res) => {
    const ticketId = req.params.ticket_id;
    try {
        const query = `
            SELECT logs.*, GROUP_CONCAT(logs_attachments.attachment) AS attachments
            FROM logs
            LEFT JOIN logs_attachments ON logs.id = logs_attachments.log_id
            WHERE logs.ticket_id = ?
            GROUP BY logs.id
            ORDER BY logs.time_date DESC
        `;
        const [results] = await db.query(query, [ticketId]);

        // Format the results to handle attachments as an array
        const formattedResults = results.map(log => ({
            ...log,
            attachments: log.attachments ? log.attachments.split(',') : []
        }));

        res.json(formattedResults);
    } catch (err) {
        console.error('Error fetching logs for ticket:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// GET a specific log by ID
router.get('/logs/:id', async (req, res) => {
    const logId = req.params.id;
    try {
        const query = 'SELECT * FROM logs WHERE id = ?';
        const [results] = await db.query(query, [logId]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching log:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST a new log
// POST a new log with attachment upload
router.post('/logs', upload.array('attachments'), async (req, res) => {
    // Destructure the request body to extract ticket_id, created_by, message, and type
    const { ticket_id, created_by, message, type } = req.body;

    try {
        // Insert the log into the database
        const query = `
            INSERT INTO logs (ticket_id, created_by, message, type)
            VALUES (?, ?, ?, ?)
        `;
        const [results] = await db.query(query, [ticket_id, created_by, message, type]);

        const logId = results.insertId; // ID of the newly created log
        console.log('Log created successfully with ID:', logId);
        // Handle attachments if provided
        if (req.files && req.files.length > 0) {
            const attachmentPromises = req.files.map(file => {
                const attachmentPath = file.path;
                const insertAttachmentQuery = `INSERT INTO logs_attachments (log_id, attachment) VALUES (?, ?)`;
                return db.query(insertAttachmentQuery, [logId, attachmentPath]);
            });
            await Promise.all(attachmentPromises);
        }

        // Fetch the attachments for the log
        const [attachmentsResults] = await db.query('SELECT attachment FROM logs_attachments WHERE log_id = ?', [logId]);
        const attachments = attachmentsResults.map(att => att.attachment);

        console.log(`Log created successfully with ID: ${logId}`);
        // Return response to the client
        res.status(201).json({ id: logId, ticket_id, created_by, attachments, message, type });

        // Fetch email recipients based on permissions
        const mails = await getEmailsForTicket(ticket_id, db);
        const fetchPermissions = `SELECT sendTo FROM sendMailTo WHERE event = ?`;
        const [permissions] = await db.query(fetchPermissions, ['log']);

        const allMails = [];
        if (permissions[0].sendTo.charAt(0) === '1') mails.Admin.forEach(mail => allMails.push(mail));
        if (permissions[0].sendTo.charAt(1) === '1') mails.HOD.forEach(mail => allMails.push(mail));
        if (permissions[0].sendTo.charAt(2) === '1') mails.TicketCreatedBy.forEach(mail => allMails.push(mail));
        if (permissions[0].sendTo.charAt(3) === '1' && mails.AssignedTo) allMails.push(mails.AssignedTo);
        if (permissions[0].sendTo.charAt(4) === '1') mails.Assignees.forEach(mail => allMails.push(mail));

        const uniqueEmails = [...new Set(allMails)];

        // Email subject and body
        const subject = `New Log Added for Ticket ID: ${ticket_id}`;
        const emailMessage = `
            A new log has been added to the ticket with ID ${ticket_id}.
            
            Log Details:
            - Created By: ${created_by}
            - Message: ${message}
            - Type: ${type}
            
            Attachments: ${attachments.length > 0 ? attachments.join(', ') : 'No attachments'}
        `;

        // Send emails to all recipients
        for (const email of uniqueEmails) {
            await sendMail(email, subject, emailMessage); // Send email using the mailService
        }

        
    } catch (err) {
        console.error('Error creating log:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// PUT (update) a specific log by ID
router.put('/logs/:id', async (req, res) => {
    const logId = req.params.id;
    const { ticket_id, created_by, attachment, message, type } = req.body;

    try {
        const query = `
            UPDATE logs
            SET ticket_id = ?, created_by = ?, attachment = ?, message = ?, type = ?, time_date = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [results] = await db.query(query, [ticket_id, created_by, attachment, message, type, logId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.status(200).json({ message: 'Log updated successfully' });
    } catch (err) {
        console.error('Error updating log:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a specific log by ID
router.delete('/logs/:id', async (req, res) => {
    const logId = req.params.id;

    try {
        const query = 'DELETE FROM logs WHERE id = ?';
        const [results] = await db.query(query, [logId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.status(200).json({ message: 'Log deleted successfully' });
    } catch (err) {
        console.error('Error deleting log:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
