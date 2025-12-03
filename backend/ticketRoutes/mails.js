const getEmailsForTicket = async (ticketId, db) => {
    try {
        // Query to get the emails of admins
        const adminQuery = `
            SELECT e.employeeEmail 
            FROM employee e
            INNER JOIN employeedesignation ed ON e.employeeId = ed.employeeId
            INNER JOIN designation d ON ed.designationId = d.designationId
            WHERE d.designationName = 'Admin'
        `;
        const [admins] = await db.query(adminQuery);
       
        

        // Query to get the email of the user who created the ticket
        const ticketCreatorQuery = `
            SELECT e.employeeEmail 
            FROM ticket t
            INNER JOIN employee e ON t.employee_id = e.EmployeeId
            WHERE t.id = ?
        `;
        const [ticketCreator] = await db.query(ticketCreatorQuery, [ticketId]);
        

        // Query to get the email of the HOD of the ticket's department
        const hodQuery = `
            SELECT e.employeeEmail 
            FROM employee e
            INNER JOIN employeedesignation ed ON e.employeeId = ed.employeeId
            INNER JOIN designation d ON ed.designationId = d.designationId
            INNER JOIN department dep ON ed.departmentId = dep.departmentId
            INNER JOIN ticket t ON t.department = dep.departmentName
            WHERE t.id = ? AND d.designationName = 'HOD'
        `;
        const [hod] = await db.query(hodQuery, [ticketId]);
        

        // Query to get the emails of all assignees in the department of the ticket
        const assigneeQuery = `
            SELECT e.employeeEmail 
            FROM employee e
            INNER JOIN employeedesignation ed ON e.employeeId = ed.employeeId
            INNER JOIN designation d ON ed.designationId = d.designationId
            INNER JOIN department dep ON ed.departmentId = dep.departmentId
            INNER JOIN ticket t ON t.department = dep.departmentName
            WHERE t.id = ? AND d.designationName = 'Assignee'
        `;
        const [assignees] = await db.query(assigneeQuery, [ticketId]);
        

        // Query to get the email of the current assignee of the ticket
        const assignedToQuery = `
            SELECT e.employeeEmail 
            FROM employee e
            INNER JOIN ticket t ON t.assignee = e.employeeName  -- Assuming assignee stores the name
            WHERE t.id = ?
        `;
        const [assignedTo] = await db.query(assignedToQuery, [ticketId]);
        

        // Prepare the response object
        const emailData = {
            Admin: admins.map(admin => admin.employeeEmail),
            TicketCreatedBy: ticketCreator.map(creator => creator.employeeEmail),
            HOD: hod.map(h => h.employeeEmail),
            Assignees: assignees.map(assignee => assignee.employeeEmail),
            AssignedTo: assignedTo.length > 0 ? assignedTo[0].employeeEmail : null, // Get the email or null if not found
        };

        
        return emailData;
    } catch (error) {
        console.error('Error fetching emails:', error);
        throw new Error('Failed to fetch emails');
    }
};

export default getEmailsForTicket;
