import { connection } from '../db/index.js'
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import dateValidate from "../validators/date.validate.js";

// Get all departments
export const getAllDepartments = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM department'

    connection.query(query, (err, data) => {
        if (err) {
            const error = new ApiError(400, 'Error retrieving departments')
            return res.status(400).json(error.toJSON())
        }
        res
            .status(200)
            .json(new ApiResponse(200, data, 'Departments retrieved successfully.'))
    })
})

// Get working / live / open departments - where departmentEndDate is NULL
export const getAllWorkingDepartments = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM department WHERE departmentEndDate IS NULL'
    connection.query(query, (err, data) => {
        if (err) {
            const error = new ApiError(400, 'Error retrieving live/open departments.')
            return res.status(400).json(error.toJSON())
        }

        res
            .status(200)
            .json(new ApiResponse(200, data, 'All live/open departments retrieved successfully.'))
    })
})

// Get closed departments where departmentEndDate is NOT NULL
export const getClosedDepartments = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM department WHERE departmentEndDate IS NOT NULL'

    connection.query(query, (err, data) => {
        if (err) {
            const error = new ApiError(400, 'Error retrieving closed departments.')
            return res.status(400).json(error.toJSON())
        }
        res
            .status(200)
            .json(new ApiResponse(200, data, 'All closed departments retrieved successfully.'))
    })
})

// Create a new department
export const addDepartment = asyncHandler(async (req, res) => {
    const { departmentName, departmentStartDate, departmentEndDate } = req.body;
    const normalizedDepartmentName = typeof departmentName === "string" ? departmentName.trim() : "";

    // Department naming rules should align with database limits and common department formats.
    if (!normalizedDepartmentName) {
        return res.status(400).json(new ApiError(400, 'Department name is required.', ['Department name is required.']));
    }

    if (normalizedDepartmentName.length > 50) {
        return res.status(400).json(new ApiError(400, 'Department name should be 50 characters or fewer.', ['Department name should be 50 characters or fewer.']));
    }

    // Validate optional dates only when they are provided
    if (departmentStartDate) {
        const startDateValidationError = dateValidate(departmentStartDate);
        if (startDateValidationError) {
            return res.status(400).json(new ApiError(400, startDateValidationError, [startDateValidationError]));
        }
    }

    if (departmentEndDate) {
        const endDateValidationError = dateValidate(departmentEndDate);
        if (endDateValidationError) {
            return res.status(400).json(new ApiError(400, endDateValidationError, [endDateValidationError]));
        }
    }

    // Ensure the start date is before the end date
    const startDate = departmentStartDate ? new Date(departmentStartDate) : null;
    const endDate = departmentEndDate ? new Date(departmentEndDate) : null;

    if (startDate !== null && endDate !== null && startDate >= endDate) {
        return res.status(400).json(new ApiError(400, 'Start date should be before the end date.', ['Start date should be before the end date.']));
    }

    const departmentSlug = normalizedDepartmentName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

    if (!departmentSlug) {
        return res.status(400).json(new ApiError(400, 'Department name must include letters or numbers.', ['Department name must include letters or numbers.']));
    }

    const checkForExistenceQuery = `SELECT * FROM department WHERE departmentSlug = ?`;

    const [checkForExistenceQueryResult] = await connection.promise().query(checkForExistenceQuery, [departmentSlug]);

    if(checkForExistenceQueryResult.length > 0) {
        return res.status(409).json(new ApiError(409, 'Department already exists.', ['Department already exists.']));
    }

    // Proceed with the query if both department name and dates are valid
    const query = `INSERT INTO department (
        departmentName, departmentSlug, departmentStartDate, departmentEndDate
    ) VALUES (?, ?, ?, ?)`;

    const values = [
        normalizedDepartmentName,
        departmentSlug,
        startDate,
        endDate,
    ];

    connection.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(new ApiError(500, 'Error creating department', [err.message]));
        }

        res
            .status(201)
            .json(new ApiResponse(201, {
                departmentId: result.insertId,
                departmentName: normalizedDepartmentName,
                departmentSlug,
                departmentStartDate: startDate,
                departmentEndDate: endDate
            }, 'Department created successfully.'));
    });
});

// Delete a department - just putting today's date (date as closing) in end date field - no removal of data is taken place
export const deleteDepartment = asyncHandler(async (req, res) => {
    const deptId = req.body.deptId;  // Extract deptId from the body
    
    console.log('=== DELETE DEPARTMENT CALLED ===');
    console.log('Department ID to delete:', deptId);

    // First check if department exists and if it's already closed
    const checkQuery = `SELECT departmentId, departmentEndDate FROM department WHERE departmentId = ?`;
    
    connection.query(checkQuery, [deptId], (checkErr, checkResult) => {
        if (checkErr) {
            console.log('Database error during check:', checkErr);
            return res.status(500).json(new ApiError(500, 'Error checking department status'));
        }
        
        if (checkResult.length === 0) {
            console.log('Department not found');
            return res.status(404).json(new ApiError(404, 'Department not found'));
        }
        
        const department = checkResult[0];
        console.log('Current department state:', department);
        
        // If already has an end date, it's already "deleted"
        if (department.departmentEndDate !== null) {
            console.log('Department already closed with end date:', department.departmentEndDate);
            return res.status(400).json(new ApiError(400, 'Department is already closed'));
        }
        
        // Proceed with setting end date
        const updateQuery = `UPDATE department SET departmentEndDate = ? WHERE departmentId = ? AND departmentEndDate IS NULL`;

        const d = new Date();
        const formattedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
        
        console.log('Setting departmentEndDate to:', formattedDate);

        const values = [
            formattedDate,
            deptId,
        ];

        connection.query(updateQuery, values, (err, data) => {
            if (err) {
                console.log('Database error during update:', err);
                return res.status(500).json(new ApiError(500, 'Error deleting department'));
            }
            
            console.log('Update query result:', data);
            console.log('Affected rows:', data.affectedRows);
            console.log('Changed rows:', data.changedRows);
            
            if (data.affectedRows === 0) {
                console.log('No rows affected - department may have been already closed');
                return res.status(400).json(new ApiError(400, 'Department could not be closed'));
            }
            
            console.log('Department deleted successfully!');
            res.status(200).json(new ApiResponse(200, { deptId, departmentEndDate: formattedDate }, 'Department deleted successfully.'));
        });
    });
});

// Update department
export const updateDepartment = asyncHandler(async (req, res) => {
    const deptId = req.body.deptId;  // Extract deptId from the body
    const departmentName = req.body.departmentName;
    const departmentStartDate = req.body.departmentStartDate;
    const departmentEndDate = req.body.departmentEndDate;

    if (!deptId || !departmentName) {
        return res.status(400).json(new ApiError(400, 'Department ID and name are required'));
    }

    // Step 1: Fetch current department details from the database
    const getCurrentDepartmentQuery = `SELECT departmentStartDate, departmentEndDate FROM department WHERE departmentId = ?`;
    connection.query(getCurrentDepartmentQuery, [deptId], (err, results) => {
        if (err) {
            console.log('Database error:', err);  // Log the error to debug
            return res.status(500).json(new ApiError(500, 'Error fetching department data'));
        }
        if (results.length === 0) {
            return res.status(404).json(new ApiError(404, 'Department not found'));
        }

        // Step 2: Get current start and end dates from the database
        const currentDepartment = results[0];
        const currentStartDate = currentDepartment.departmentStartDate;
        const currentEndDate = currentDepartment.departmentEndDate;

        // Step 3: Prepare values to be updated
        const updatedDepartmentStartDate = departmentStartDate || currentStartDate;  // Use existing date if not provided
        const updatedDepartmentEndDate = departmentEndDate || currentEndDate;        // Use existing date if not provided

        // Step 4: Update the department with new or existing values
        const updateQuery = `UPDATE department SET
            departmentName = ?,
            departmentStartDate = ?,
            departmentEndDate = ?
            WHERE departmentId = ?`;

        const values = [
            departmentName,
            updatedDepartmentStartDate,
            updatedDepartmentEndDate,
            deptId
        ];

        connection.query(updateQuery, values, (err, data) => {
            if (err) {
                console.log('Database error:', err);  // Log the error to debug
                return res.status(500).json(new ApiError(500, 'Error updating department'));
            }
            if (data.affectedRows === 0) {
                return res.status(404).json(new ApiError(404, 'Department not found'));
            }
            res.status(200).json(new ApiResponse(200, req.body, 'Department updated successfully.'));
        });
    });
});

export const moveEmployee = asyncHandler(async (req, res) => {
    const { employeeIds, toDepartmentId } = req.body;

    // Validate the request payload
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid or missing employee IDs", ["employeeIds must be provided as a non-empty array"]));
    }

    if (!toDepartmentId) {
        return res
            .status(400)
            .json(new ApiError(400, "Target department ID is required"));
    }

    try {
        // Step 1: Validate that the target department exists and is active
        const [departmentRows] = await connection.promise().query(
            "SELECT * FROM department WHERE departmentId = ? AND departmentEndDate IS NULL",
            [toDepartmentId]
        );

        if (departmentRows.length === 0) {
            return res
                .status(404)
                .json(new ApiError(404, "Target department does not exist or is inactive"));
        }

        // Step 2: Validate that all provided employees exist
        const [existingEmployees] = await connection.promise().query(
            "SELECT employeeId FROM employee WHERE employeeId IN (?)",
            [employeeIds]
        );

        const validEmployeeIds = existingEmployees.map((e) => e.employeeId);
        const invalidEmployeeIds = employeeIds.filter((id) => !validEmployeeIds.includes(id));

        if (invalidEmployeeIds.length > 0) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid employee IDs", [`Invalid IDs: ${invalidEmployeeIds.join(", ")}`]));
        }

        // Step 3: Update the departmentId for the valid employees in employeedesignation
        const [updateResult] = await connection.promise().query(
            `
            UPDATE employeedesignation
            SET departmentId = ?
            WHERE employeeId IN (?)
            `,
            [toDepartmentId, validEmployeeIds]
        );

        // Check if any rows were updated
        if (updateResult.affectedRows === 0) {
            return res
                .status(404)
                .json(new ApiError(404, "No employees were updated. Please verify the records."));
        }

        // Step 4: Respond with success
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { updatedEmployees: validEmployeeIds },
                    "Employees successfully moved to the new department"
                )
            );
    } catch (error) {
        console.error("Error in moveEmployee function:", error.message);
        return res
            .status(500)
            .json(new ApiError(500, "An error occurred while moving employees"));
    }
});

export const deleteMultipleEmployees = asyncHandler(async (req, res) => {
    const { employeeIds } = req.body; // Receive an array of employee IDs

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({ message: "No employees provided for deletion" });
    }

    try {
        // Use SQL IN clause to delete multiple employees
        await connection.promise().query(
            'DELETE FROM employee WHERE employeeId IN (?)',
            [employeeIds]
        );

        res.status(200).json({ message: "Employees deleted successfully" });
    } catch (error) {
        console.error("Error deleting employees:", error.message);
        throw new ApiError(500, "An error occurred while deleting employees.");
    }
});
