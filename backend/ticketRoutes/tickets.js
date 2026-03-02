import express from 'express'
const router = express.Router()
import db from '../config.js'

import multer from 'multer'
import getEmailsForTicket from './mails.js'
import sendMail from './mailservice.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import e from 'express'

// Replicate __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './ticketRoutes/uploads') // Relative path from server root
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  },
})

const upload = multer({ storage })

// GET all tickets
// router.get('/tickets', async (req, res) => {
//   try {
//     const [results] = await db.query('SELECT * FROM ticket order by ticket_created_at desc');
//     res.json(results);
//   } catch (err) {
//     console.error('Error fetching tickets:', err);
//     res.status(500).send('Server error');
//   }
// });

// GET ticket summary counts
router.get('/tickets/summary', async (req, res) => {
  try {
    const { employee_id, department, assignee, assigneeDepartment } = req.query

    let conditions = []
    let params = []

    // Add filters based on query parameters
    if (employee_id) {
      conditions.push('employee_id = ?')
      params.push(employee_id)
    }
    if (department) {
      conditions.push('department = ?')
      params.push(department)
    }
    if (assignee) {
      conditions.push('assignee = ?')
      params.push(assignee)
    }
    conditions.push('1 = ?')
    params.push(1)
    // Build the WHERE clause
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const assigneeWhere = assignee ? `WHERE department = ?` : ''

    // Queries for different counts
    const queries = {
      overdue: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND ticket_created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'close'`,
      dueToday: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND DATE(ticket_created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      open: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND status = 'open'`,
      onHold: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND status = 'hold'`,
      unassigned: assignee
        ? `SELECT COUNT(*) AS count FROM ticket ${assigneeWhere} AND (assignee IS NULL OR assignee = '')`
        : `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND (assignee IS NULL OR assignee = '')`,
      allTickets: `SELECT COUNT(*) AS count FROM ticket ${whereClause}`,
      statusCounts: `SELECT status, COUNT(*) AS count FROM ticket ${whereClause} GROUP BY status`,
      categoryCounts: `SELECT issue_type, COUNT(*) AS count FROM ticket ${whereClause} GROUP BY issue_type`,
      priorityCounts: `SELECT priority, COUNT(*) AS count FROM ticket ${whereClause} GROUP BY priority`,
    }

    // Execute all queries in parallel
    const [[overdue]] = await db.query(queries.overdue, params)
    const [[dueToday]] = await db.query(queries.dueToday, params)
    const [[open]] = await db.query(queries.open, params)
    const [[onHold]] = await db.query(queries.onHold, params)
    const [[unassigned]] = assignee
      ? await db.query(queries.unassigned, [assigneeDepartment])
      : await db.query(queries.unassigned, params)
    const [[allTickets]] = await db.query(queries.allTickets, params)
    const [statusCounts] = await db.query(queries.statusCounts, params)
    const [categoryCounts] = await db.query(queries.categoryCounts, params)
    const [priorityCounts] = await db.query(queries.priorityCounts, params)

    // Construct response
    const response = {
      summary: {
        overdue: overdue.count,
        dueToday: dueToday.count,
        open: open.count,
        onHold: onHold.count,
        unassigned: unassigned.count,
        allTickets: allTickets.count,
      },
      statusData: statusCounts.map((row) => ({
        label: row.status
          ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
          : 'Unknown', // Default label for undefined/null statuses
        count: row.count || 0, // Default count as 0 if undefined
      })),
      categories: categoryCounts.map((row) => ({
        label: row.issue_type || 'Unknown', // Default label for undefined/null issue types
        count: row.count || 0, // Default count as 0 if undefined
      })),
      priority: priorityCounts.map((row) => ({
        label: row.priority || 'Unknown', // Default label for undefined/null issue types
        count: row.count || 0, // Default count as 0 if undefined
      })),
    }

    res.json(response)
  } catch (err) {
    console.error('Error fetching ticket summary:', err)
    res.status(500).send('Server error')
  }
})

// GET ticket summary counts
router.get('/tickets/summary2', async (req, res) => {
  try {
    const { employee_id, department, assignee } = req.query
    const accessLevel = parseInt(req.query.accessLevel, 10) // Convert to integer during assignment

    console.log(employee_id)
    console.log(department)
    console.log(assignee)
    console.log(accessLevel)

    // Define SQL conditions for each access level
    if (accessLevel === 2) {
      let params = []

      const query1 = `SELECT COUNT(DISTINCT t.id) AS count
    FROM 
        ticket t
    JOIN 
        employee e ON t.employee_id = e.employeeId
    JOIN 
        employeeDesignation ed ON e.employeeId = ed.employeeId
    JOIN 
        department d ON ed.departmentId = d.departmentId
    WHERE 
        d.departmentName = ? AND `

      const query2 = ` 
    FROM 
        ticket t
    JOIN 
        employee e ON t.employee_id = e.employeeId
    JOIN 
        employeeDesignation ed ON e.employeeId = ed.employeeId
    JOIN 
        department d ON ed.departmentId = d.departmentId
    WHERE 
        d.departmentName = ? `

      const queries = {
        overdue: `${query1} t.ticket_created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND t.status != 'close'`,
        dueToday: `${query1} DATE(t.ticket_created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        open: `${query1} t.status = 'open'`,
        onHold: `${query1} t.status = 'hold'`,
        unassigned: `${query1} (t.assignee IS NULL OR t.assignee = '')`,
        allTickets: `${query1} 1 = 1`,
        statusCounts: `select t.status, COUNT(DISTINCT t.id) AS count ${query2} GROUP BY t.status`,
        categoryCounts: `select t.issue_type, COUNT(DISTINCT t.id) AS count ${query2} GROUP BY t.issue_type`,
        priorityCounts: `select t.priority, COUNT(DISTINCT t.id) AS count ${query2} GROUP BY t.priority`,
      }

      if (accessLevel === 2 && department) params.push(department)

      const [[overdue]] = await db.query(queries.overdue, params)
      const [[dueToday]] = await db.query(queries.dueToday, params)
      const [[open]] = await db.query(queries.open, params)
      const [[onHold]] = await db.query(queries.onHold, params)
      const [[unassigned]] = await db.query(queries.unassigned, params)
      const [[allTickets]] = await db.query(queries.allTickets, params)
      const [statusCounts] = await db.query(queries.statusCounts, params)
      const [categoryCounts] = await db.query(queries.categoryCounts, params)
      const [priorityCounts] = await db.query(queries.priorityCounts, params)

      const response = {
        summary: {
          overdue: overdue.count,
          dueToday: dueToday.count,
          open: open.count,
          onHold: onHold.count,
          unassigned: unassigned.count,
          allTickets: allTickets.count,
        },
        statusData: statusCounts.map((row) => ({
          label: row.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
            : 'Unknown',
          count: row.count || 0,
        })),
        categories: categoryCounts.map((row) => ({
          label: row.issue_type || 'Unknown',
          count: row.count || 0,
        })),
        priority: priorityCounts.map((row) => ({
          label: row.priority || 'Unknown',
          count: row.count || 0,
        })),
      }

      res.json(response)
    } else {
      const accessConditions = {
        1: 'employee_id = ?', // VIEW_SELF_CREATED_TICKETS
        3: 'department = ?',
        4: '1 = 1', // VIEW_ALL_TICKETS (no specific condition)
        5: 'assignee = ?', // VIEW_ASSIGNED_TICKETS
      }

      let conditions = [accessConditions[accessLevel]] // Start with the condition for the access level
      let params = []

      // Add parameters based on the access level
      if (accessLevel === 1 && employee_id) params.push(employee_id)
      if (accessLevel === 3 && department) params.push(department)
      if (accessLevel === 5 && assignee) params.push(assignee)

      // Build the WHERE clause
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Queries for different counts
      const queries = {
        overdue: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND ticket_created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'close'`,
        dueToday: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND DATE(ticket_created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        open: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND status = 'open'`,
        onHold: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND status = 'hold'`,
        unassigned: `SELECT COUNT(*) AS count FROM ticket ${whereClause} AND (assignee IS NULL OR assignee = '')`,
        allTickets: `SELECT COUNT(*) AS count FROM ticket ${whereClause}`,
        statusCounts: `SELECT status, COUNT(*) AS count FROM ticket ${whereClause} GROUP BY status`,
        categoryCounts: `SELECT issue_type, COUNT(*) AS count FROM ticket ${whereClause} GROUP BY issue_type`,
        priorityCounts: `SELECT priority, COUNT(*) AS count FROM ticket ${whereClause} GROUP BY priority`,
      }

      // Execute all queries in parallel
      const [[overdue]] = await db.query(queries.overdue, params)
      const [[dueToday]] = await db.query(queries.dueToday, params)
      const [[open]] = await db.query(queries.open, params)
      const [[onHold]] = await db.query(queries.onHold, params)
      const [[unassigned]] = await db.query(queries.unassigned, params)
      const [[allTickets]] = await db.query(queries.allTickets, params)
      const [statusCounts] = await db.query(queries.statusCounts, params)
      const [categoryCounts] = await db.query(queries.categoryCounts, params)
      const [priorityCounts] = await db.query(queries.priorityCounts, params)

      // Construct response
      const response = {
        summary: {
          overdue: overdue.count,
          dueToday: dueToday.count,
          open: open.count,
          onHold: onHold.count,
          unassigned: unassigned.count,
          allTickets: allTickets.count,
        },
        statusData: statusCounts.map((row) => ({
          label: row.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
            : 'Unknown',
          count: row.count || 0,
        })),
        categories: categoryCounts.map((row) => ({
          label: row.issue_type || 'Unknown',
          count: row.count || 0,
        })),
        priority: priorityCounts.map((row) => ({
          label: row.priority || 'Unknown',
          count: row.count || 0,
        })),
      }

      res.json(response)
    }
  } catch (err) {
    console.error('Error fetching ticket summary:', err)
    res.status(500).send('Server error')
  }
})

//Filtered Tickets
router.get('/filteredTickets', async (req, res) => {
  console.log('called filtered ticket')
  try {
    const {
      employee_id,
      department,
      assignee,
      assigneeDepartment,
      ticketsType,
    } = req.query
    console.log(assigneeDepartment)
    console.log(employee_id)
    console.log(department)
    console.log(assignee)
    console.log(ticketsType)

    let conditions = []
    let params = []

    // Add filters based on query parameters
    if (employee_id) {
      conditions.push('employee_id = ?')
      params.push(employee_id)
    }
    if (department) {
      conditions.push('department = ?')
      params.push(department)
    }
    if (assignee) {
      conditions.push('assignee = ?')
      params.push(assignee)
    }
    conditions.push('1 = ?')
    params.push(1)
    // Build the WHERE clause
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const assigneeWhere = assignee ? `WHERE department = ?` : ''

    // Queries for different counts
    const queries = {
      overdue: `SELECT * FROM ticket ${whereClause} AND ticket_created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'close'`,
      dueToday: `SELECT * FROM ticket ${whereClause} AND DATEDIFF(CURDATE(), DATE(ticket_created_at)) = 7`,
      open: `SELECT * FROM ticket ${whereClause} AND status = 'open'`,
      onHold: `SELECT * FROM ticket ${whereClause} AND status = 'hold'`,
      unassigned: assignee
        ? `SELECT * FROM ticket ${assigneeWhere} AND (assignee IS NULL OR assignee = '')`
        : `SELECT * FROM ticket ${whereClause} AND (assignee IS NULL OR assignee = '')`,
      allTickets: `SELECT * FROM ticket ${whereClause}`,
      statusCounts: `SELECT status, * FROM ticket ${whereClause} GROUP BY status`,
      categoryCounts: `SELECT issue_type, * FROM ticket ${whereClause} GROUP BY issue_type`,
      priorityCounts: `SELECT priority, * FROM ticket ${whereClause} GROUP BY priority`,
    }

    let response = []

    switch (ticketsType) {
      case 'Overdue':
        ;[response] = await db.query(queries.overdue, params)
        break
      case 'Due today':
        ;[response] = await db.query(queries.dueToday, params)
        break
      case 'Open':
        ;[response] = await db.query(queries.open, params)
        break
      case 'On hold':
        ;[response] = await db.query(queries.onHold, params)
        break
      case 'Unassigned':
        ;[response] = assignee
          ? await db.query(queries.unassigned, [assigneeDepartment])
          : await db.query(queries.unassigned, params)
        break
      case 'All tickets':
        ;[response] = await db.query(queries.allTickets, params)
        break
      default:
        break
    }
    // Construct response

    console.log(response)
    res.json(response)
  } catch (err) {
    console.error('Error fetching filtered ticket:', err)
    res.status(500).send('Server error')
  }
})

//Filtered Tickets
router.get('/filteredTickets2', async (req, res) => {
  console.log('called filtered ticket2')
  try {
    const {
      employee_id,
      department,
      assignee,
      assigneeDepartment,
      ticketsType,
    } = req.query
    const accessLevel = parseInt(req.query.accessLevel, 10) // Parse accessLevel as an integer

    if (accessLevel === 2) {
      let params = []

      const query1 = `SELECT t.*
      FROM 
          ticket t
      JOIN 
          employee e ON t.employee_id = e.employeeId
      JOIN 
          employeeDesignation ed ON e.employeeId = ed.employeeId
      JOIN 
          department d ON ed.departmentId = d.departmentId
      WHERE 
          d.departmentName = ? AND `

      const queries = {
        overdue: `${query1} t.ticket_created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND t.status != 'close'`,
        dueToday: `${query1} DATE(t.ticket_created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        open: `${query1} t.status = 'open'`,
        onHold: `${query1} t.status = 'hold'`,
        unassigned: `${query1} (t.assignee IS NULL OR t.assignee = '')`,
        allTickets: `${query1} 1 = 1`,
      }

      if (accessLevel === 2 && department) params.push(department)

      let response = []

      switch (ticketsType) {
        case 'Overdue':
          ;[response] = await db.query(queries.overdue, params)
          break
        case 'Due today':
          ;[response] = await db.query(queries.dueToday, params)
          break
        case 'Open':
          ;[response] = await db.query(queries.open, params)
          break
        case 'On hold':
          ;[response] = await db.query(queries.onHold, params)
          break
        case 'Unassigned':
          ;[response] = assignee
            ? await db.query(queries.unassigned, [assigneeDepartment])
            : await db.query(queries.unassigned, params)
          break
        case 'All tickets':
          ;[response] = await db.query(queries.allTickets, params)
          break
        default:
          break
      }
      // Construct response

      console.log(response)

      res.json(response)
    } else {
      const accessConditions = {
        1: 'employee_id = ?', // VIEW_SELF_CREATED_TICKETS
        3: 'department = ?',
        4: '1 = 1', // VIEW_ALL_TICKETS (no specific condition)
        5: 'assignee = ?', // VIEW_ASSIGNED_TICKETS
      }

      let conditions = [accessConditions[accessLevel]] // Start with the condition for the access level
      let params = []

      // Add parameters based on the access level
      if (accessLevel === 1 && employee_id) params.push(employee_id)
      if (accessLevel === 3 && department) params.push(department)
      if (accessLevel === 5 && assignee) params.push(assignee)
      conditions.push('1 = ?')
      params.push(1)

      // Build the WHERE clause
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Queries for different counts
      const queries = {
        overdue: `SELECT * FROM ticket ${whereClause} AND ticket_created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'close'`,
        dueToday: `SELECT * FROM ticket ${whereClause} AND DATE(ticket_created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        open: `SELECT *  FROM ticket ${whereClause} AND status = 'open'`,
        onHold: `SELECT *  FROM ticket ${whereClause} AND status = 'hold'`,
        unassigned: `SELECT *  FROM ticket ${whereClause} AND (assignee IS NULL OR assignee = '')`,
        allTickets: `SELECT *  FROM ticket ${whereClause}`,
      }

      let response = []

      switch (ticketsType) {
        case 'Overdue':
          ;[response] = await db.query(queries.overdue, params)
          break
        case 'Due today':
          ;[response] = await db.query(queries.dueToday, params)
          break
        case 'Open':
          ;[response] = await db.query(queries.open, params)
          break
        case 'On hold':
          ;[response] = await db.query(queries.onHold, params)
          break
        case 'Unassigned':
          ;[response] = assignee
            ? await db.query(queries.unassigned, [assigneeDepartment])
            : await db.query(queries.unassigned, params)
          break
        case 'All tickets':
          ;[response] = await db.query(queries.allTickets, params)
          break
        default:
          break
      }
      // Construct response

      console.log(response)
      res.json(response)
    }
  } catch (err) {
    console.error('Error fetching filtered ticket:', err)
    res.status(500).send('Server error')
  }
})

// GET all tickets with optional filtering by employee_id or department
router.get('/tickets', async (req, res) => {
  try {
    const { employee_id, department, assignee } = req.query

    let query = 'SELECT * FROM ticket'
    const params = []

    if (employee_id) {
      query += ' WHERE employee_id = ?'
      params.push(employee_id)
    } else if (assignee) {
      console.log(assignee)
      query += ' WHERE assignee = ?'
      params.push(assignee)
    } else if (department) {
      query += ' WHERE department = ?'
      params.push(department)
    }

    query += ' ORDER BY ticket_created_at DESC'

    const [results] = await db.query(query, params)
    res.json(results)
  } catch (err) {
    console.error('Error fetching tickets:', err)
    res.status(500).send('Server error')
  }
})

// GET all tickets of a specific department using path parameter
router.get('/tickets/department/:department', async (req, res) => {
  const department = req.params.department

  try {
    // Fetch tickets for the specific department
    const query =
      'SELECT * FROM ticket WHERE department = ? ORDER BY ticket_created_at DESC'
    const [results] = await db.query(query, [department])

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'No tickets found for this department' })
    }

    res.json(results)
  } catch (err) {
    console.error('Error fetching tickets for department:', err)
    res.status(500).send('Server error')
  }
})

// GET a specific ticket by ID with attachments
router.get('/tickets/:id', async (req, res) => {
  const ticketId = req.params.id
  try {
    // Fetch main ticket details
    const [ticketResults] = await db.query(
      'SELECT * FROM ticket WHERE id = ?',
      [ticketId]
    )
    if (ticketResults.length === 0) {
      return res.status(404).send('Ticket not found')
    }

    // Fetch attachments associated with the ticket
    const [attachmentsResults] = await db.query(
      'SELECT attachment FROM ticket_attachments WHERE ticket_id = ?',
      [ticketId]
    )

    res.json({
      ...ticketResults[0],
      attachments: attachmentsResults.map((att) => att.attachment),
    })
  } catch (err) {
    console.error('Error fetching ticket:', err)
    res.status(500).send('Server error')
  }
})

router.post('/', upload.array('attachments', 10), async (req, res) => {
  const {
    title,
    description,
    details,
    department,
    issue_type,
    priority,
    status,
    assignee,
    employee_id,
    createdBy,
  } = req.body

  // const attachments = req.file ? req.file.path : null; // If the file exists

  try {
    console.log('Received ticket creation request with data:', req.body)

    // Insert the main ticket details
    const insertTicketQuery = `INSERT INTO ticket (title, description, details, department, issue_type, priority, status, assignee, employee_id, createdBy)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`
    const [ticketResult] = await db.query(insertTicketQuery, [
      title,
      description,
      details,
      department,
      issue_type,
      priority,
      status,
      assignee,
      employee_id,
      createdBy,
    ])
    const ticketId = ticketResult.insertId

    // Insert each attachment path into the ticket_attachments table
    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map((file) => {
        const attachmentPath = file.path
        const insertAttachmentQuery = `INSERT INTO ticket_attachments (ticket_id, attachment) VALUES (?, ?)`
        return db.query(insertAttachmentQuery, [ticketId, attachmentPath])
      })
      await Promise.all(attachmentPromises)
    }

    if (assignee) {
      const fetchAssigneeQuery = `SELECT id FROM employee WHERE name = ?`
      const [assigneeResult] = await db.query(fetchAssigneeQuery, [assignee])

      if (assigneeResult.length > 0) {
        const assigneeId = assigneeResult[0].id
        const insertAssigneeHistoryQuery = `INSERT INTO ticket_assignee_history (ticket_id, assignee_id) VALUES (?, ?)`
        await db.query(insertAssigneeHistoryQuery, [ticketId, assigneeId])
      } else {
        res.status(404).json({ error: 'Assignee not found' })
      }
    }

    res.status(201).json({ message: 'Ticket created successfully', ticketId })

    const mails = await getEmailsForTicket(ticketId, db)
    const fetchPermissions = `SELECT sendTo FROM sendMailTo WHERE event = ?`
    const [permissions] = await db.query(fetchPermissions, ['ticketCreated'])
    console.log(permissions[0].sendTo)
    console.log(mails)
    const allMails = []
    if (permissions[0].sendTo.charAt(0) === '1') {
      mails.Admin.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(1) === '1') {
      mails.HOD.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(2) === '1') {
      mails.TicketCreatedBy.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(3) === '1' && mails.AssignedTo) {
      allMails.push(mails.AssignedTo)
    }
    if (permissions[0].sendTo.charAt(4) === '1') {
      mails.Assignees.forEach((mail) => {
        allMails.push(mail)
      })
    }
    console.log(allMails)
    const mailsSet = new Set(allMails)

    const uniqueEmails = [...new Set(allMails)]
    const subject = `New Ticket Created: ${title}`
    const message = `A new ticket has been created with ID: ${ticketId}\n\nDetails:\nTitle: ${title}\nDescription: ${description}\nPriority: ${priority}\nStatus: ${status}`

    for (const email of uniqueEmails) {
      await sendMail(email, subject, message)
    }
  } catch (error) {
    console.error('Error creating ticket:', error)
    res.status(500).json({ error: 'Error creating ticket' })
  }
})

router.put('/:ticketId', upload.array('attachments', 10), async (req, res) => {
  const { ticketId } = req.params
  const {
    title,
    description,
    details,
    department,
    issue_type,
    priority,
    status,
    assignee,
  } = req.body

  try {
    console.log('Received ticket update request with data:', req.body)

    // Update the main ticket details
    const updateTicketQuery = `UPDATE ticket
                               SET title = ?, description = ?, details = ?, department = ?, issue_type = ?, priority = ?, status = ?, assignee = ?
                               WHERE id = ?`
    await db.query(updateTicketQuery, [
      title,
      description,
      details,
      department,
      issue_type,
      priority,
      status,
      assignee,
      ticketId,
    ])

    // Update ticket attachments (if provided)
    if (req.files && req.files.length > 0) {
      // First, remove the old attachments
      const deleteOldAttachmentsQuery = `DELETE FROM ticket_attachments WHERE ticket_id = ?`
      await db.query(deleteOldAttachmentsQuery, [ticketId])

      // Insert new attachments
      const attachmentPromises = req.files.map((file) => {
        const attachmentPath = file.path
        const insertAttachmentQuery = `INSERT INTO ticket_attachments (ticket_id, attachment) VALUES (?, ?)`
        return db.query(insertAttachmentQuery, [ticketId, attachmentPath])
      })
      await Promise.all(attachmentPromises)
    }

    // Update ticket assignee history (if assignee is updated)
    if (assignee) {
      const fetchAssigneeQuery = `SELECT id FROM employee WHERE name = ?`
      const [assigneeResult] = await db.query(fetchAssigneeQuery, [assignee])

      if (assigneeResult.length > 0) {
        const assigneeId = assigneeResult[0].id

        // Insert a new record in the ticket_assignee_history
        const insertAssigneeHistoryQuery = `INSERT INTO ticket_assignee_history (ticket_id, assignee_id) VALUES (?, ?)`
        await db.query(insertAssigneeHistoryQuery, [ticketId, assigneeId])
      } else {
        return res.status(404).json({ error: 'Assignee not found' })
      }
    }

    res.status(200).json({ message: 'Ticket updated successfully' })

    // Optionally send notifications (similar logic to POST route)
    const mails = await getEmailsForTicket(ticketId, db)
    const fetchPermissions = `SELECT sendTo FROM sendMailTo WHERE event = ?`
    const [permissions] = await db.query(fetchPermissions, ['ticketCreated'])

    const allMails = []
    if (permissions[0].sendTo.charAt(0) === '1') {
      mails.Admin.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(1) === '1') {
      mails.HOD.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(2) === '1') {
      mails.TicketCreatedBy.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(3) === '1' && mails.AssignedTo) {
      allMails.push(mails.AssignedTo)
    }
    if (permissions[0].sendTo.charAt(4) === '1') {
      mails.Assignees.forEach((mail) => {
        allMails.push(mail)
      })
    }

    const uniqueEmails = [...new Set(allMails)]
    const subject = `Ticket Updated: ${title}`
    const message = `Ticket with ID: ${ticketId} has been updated.\n\nUpdated Details:\nTitle: ${title}\nDescription: ${description}\nPriority: ${priority}\nStatus: ${status}`

    for (const email of uniqueEmails) {
      await sendMail(email, subject, message)
    }
  } catch (error) {
    console.error('Error updating ticket:', error)
    res.status(500).json({ error: 'Error updating ticket' })
  }
})

// PUT route to update the status of a ticket by ID
router.put('/tickets/:id/status', async (req, res) => {
  const ticketId = req.params.id
  const { status } = req.body
  console.log(status)

  try {
    const [ticket] = await db.query('SELECT status FROM ticket WHERE id = ?', [
      ticketId,
    ])
    // Update the status and last_status_updated_at for the ticket
    const previousStatus = ticket[0].status
    const updateTicketQuery = `
          UPDATE ticket 
          SET status = ?, last_status_updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
      `

    const [results] = await db.query(updateTicketQuery, [status, ticketId])
    const [updatedTicket] = await db.query(
      'SELECT * FROM ticket WHERE id = ?',
      [ticketId]
    )

    if (results.affectedRows === 0) {
      res
        .status(404)
        .json({ message: 'Ticket not found or no change in status' })
    } else {
      console.log(`Ticket ID: ${ticketId} status updated to: ${status}`)

      res.status(200).json({
        message: 'Ticket status updated successfully',
        ticket: updatedTicket[0], // Send the first (and only) ticket from the query result
      })

      const mails = await getEmailsForTicket(ticketId, db)
      const fetchPermissions = `SELECT sendTo FROM sendMailTo WHERE event = ?`
      const [permissions] = await db.query(fetchPermissions, ['statusChange'])
      console.log(permissions[0].sendTo)
      console.log(mails)
      const allMails = []
      if (permissions[0].sendTo.charAt(0) === '1') {
        mails.Admin.forEach((mail) => {
          allMails.push(mail)
        })
      }
      if (permissions[0].sendTo.charAt(1) === '1') {
        mails.HOD.forEach((mail) => {
          allMails.push(mail)
        })
      }
      if (permissions[0].sendTo.charAt(2) === '1') {
        mails.TicketCreatedBy.forEach((mail) => {
          allMails.push(mail)
        })
      }
      if (permissions[0].sendTo.charAt(3) === '1' && mails.AssignedTo) {
        allMails.push(mails.AssignedTo)
      }
      if (permissions[0].sendTo.charAt(4) === '1') {
        mails.Assignees.forEach((mail) => {
          allMails.push(mail)
        })
      }

      const uniqueEmails = [...new Set(allMails)]

      // Email subject and body
      const subject = `Ticket ID: ${ticketId} Status Updated`
      const message = `
        The status of the ticket with ID ${ticketId} has been updated.
        
        Previous Status: ${previousStatus}
        New Status: ${status}
      
        Ticket Details:
        Title: ${updatedTicket[0].title}
        Description: ${updatedTicket[0].description}
        Priority: ${updatedTicket[0].priority}
        Department: ${updatedTicket[0].department}
      `

      // Send emails to all recipients
      for (const email of uniqueEmails) {
        await sendMail(email, subject, message)
      }
    }
  } catch (err) {
    console.error('Error updating ticket status:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT route to update the assignee of a ticket by ID
router.put('/tickets/:id/assignee', async (req, res) => {
  const ticketId = req.params.id
  const { assignee } = req.body

  try {
    // Fetch the employee ID for the new assignee
    // const fetchAssigneeQuery = `SELECT id FROM employee WHERE name = ?`;
    // const [assigneeResult] = await db.query(fetchAssigneeQuery, [assignee]);

    // if (assigneeResult.length === 0) {
    //   return res.status(404).json({ message: 'Assignee not found' });
    // }

    // const assigneeId = assigneeResult[0].id;

    // Update the ticket's assignee
    const [ticket] = await db.query(
      'SELECT assignee FROM ticket WHERE id = ?',
      [ticketId]
    )
    const updateAssigneeQuery = `
      UPDATE ticket 
      SET assignee = ?, last_status_updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `
    const previousAssignee = ticket[0].assignee || '-' // Default to '-' if no previous assignee exists

    const [results] = await db.query(updateAssigneeQuery, [assignee, ticketId])

    const [updatedTicket] = await db.query(
      'SELECT * FROM ticket WHERE id = ?',
      [ticketId]
    )

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Ticket not found or no change in assignee' })
    }

    console.log(`Ticket ID: ${ticketId} assignee updated to: ${assignee}`)
    res.status(200).json({
      message: 'Ticket assignee updated successfully',
      ticket: updatedTicket[0], // Send the first (and only) ticket from the query result
    })
    const mails = await getEmailsForTicket(ticketId, db)
    const fetchPermissions = `SELECT sendTo FROM sendMailTo WHERE event = ?`
    const [permissions] = await db.query(fetchPermissions, ['assigneeChange'])
    console.log(permissions[0].sendTo)
    console.log(mails)
    const allMails = []
    if (permissions[0].sendTo.charAt(0) === '1') {
      mails.Admin.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(1) === '1') {
      mails.HOD.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(2) === '1') {
      mails.TicketCreatedBy.forEach((mail) => {
        allMails.push(mail)
      })
    }
    if (permissions[0].sendTo.charAt(3) === '1' && mails.AssignedTo) {
      allMails.push(mails.AssignedTo)
    }
    if (permissions[0].sendTo.charAt(4) === '1') {
      mails.Assignees.forEach((mail) => {
        allMails.push(mail)
      })
    }

    const uniqueEmails = [...new Set(allMails)]

    // Email subject and body
    const subject = `Ticket ID: ${ticketId} Assignee Updated`
    const message = `
      The assignee for the ticket with ID ${ticketId} has been updated.
      
      Previous Assignee: ${previousAssignee}
      New Assignee: ${assignee}

      Ticket Details:
      Title: ${updatedTicket[0].title}
      Description: ${updatedTicket[0].description}
      Priority: ${updatedTicket[0].priority}
      Department: ${updatedTicket[0].department}
    `

    // Send emails to all recipients
    for (const email of uniqueEmails) {
      await sendMail(email, subject, message)
    }
  } catch (err) {
    console.error('Error updating ticket assignee:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
