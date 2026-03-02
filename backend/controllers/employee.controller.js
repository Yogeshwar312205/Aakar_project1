import asyncHandler from "../utils/asyncHandler.js";
import {connection} from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import {generateAccessToken, generateRefreshToken} from "../utils/tokens.js";

const generateAccessAndRefreshToken = async (employeeId) => {
    try {
        const [employeeRows] = await connection.promise().query(
            "SELECT * FROM employee WHERE employeeId = ?",
            [employeeId]
        );

        if (employeeRows.length === 0) {
            throw new ApiError(404, "Employee not found");
        }

        const user = employeeRows[0];

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        return {accessToken, refreshToken};
    } catch (error) {
        console.error("Error in generateAccessAndRefreshToken:", error.message);
        throw new ApiError(500, "Something went wrong while creating tokens.");
    }
};

// export const loginEmployee = asyncHandler(async (req, res) => {
//     const {employeeEmail, employeePassword} = req.body;
//
//     // Find employee by email
//     connection.query(
//         "SELECT * FROM employee WHERE employeeEmail = ?",
//         [employeeEmail],
//         async (err, results) => {
//             if (err || results.length === 0) {
//                 return res.status(401).json({message: "Invalid email or password"});
//             }
//
//             const employee = results[0];
//
//             // Check if the password matches
//             const isPasswordValid = await bcrypt.compare(employeePassword, employee.employeePassword);
//             if (!isPasswordValid) {
//                 return res.status(401).json({message: "Invalid email or password"});
//             }
//
//             // Generate access and refresh tokens
//             const {accessToken, refreshToken} = await generateAccessAndRefreshToken(employee.employeeId);
//
//             // Update refresh token in the database
//             try {
//                 await connection.promise().query(
//                     "UPDATE employee SET employeeRefreshToken = ? WHERE employeeId = ?",
//                     [refreshToken, employee.employeeId]
//                 );
//             } catch (error) {
//                 console.error("Error updating refresh token:", error.message);
//                 return res.status(500).json(
//                     new ApiResponse(500, {}, "Error while updating refresh token")
//                 );
//             }
//
//             // Fetch employee details without sensitive information
//             const [employeeData] = await connection.promise().query(
//                 `SELECT
//                     e.employeeId,
//                     e.customEmployeeId,
//                     e.employeeName,
//                     e.companyName,
//                     e.employeeQualification,
//                     e.experienceInYears,
//                     e.employeeDOB,
//                     e.employeeJoinDate,
//                     e.employeeGender,
//                     e.employeePhone,
//                     e.employeeEmail,
//                     e.employeeAccess,
//                     e.createdAt,
//                     e.employeeEndDate,
//                     d.departmentName,
//                     ds.designationName,
//                     m.employeeName AS managerName
//                 FROM
//                     employee e
//                 LEFT JOIN
//                     employeeDesignation ed ON e.employeeId = ed.employeeId
//                 LEFT JOIN
//                     department d ON ed.departmentId = d.departmentId
//                 LEFT JOIN
//                     designation ds ON ed.designationId = ds.designationId
//                 LEFT JOIN
//                     employee m ON ed.managerId = m.employeeId
//                 WHERE
//                     e.employeeId = ?;`,
//                 [employee.employeeId]
//             );
//
//             if (employeeData.length === 0) {
//                 return res
//                     .status(404)
//                     .json({message: "Employee not found after login."});
//             }
//
//             const employeeDetails = employeeData[0];
//
//             // Set accessToken as an HTTP-only cookie
//             const cookieOptions = {
//                 httpOnly: true,
//                 secure: true,
//                 sameSite: "None",
//             };
//
//             console.log(accessToken.length, refreshToken.length)
//             // Respond with employee details, accessToken, and refreshToken
//             return res
//                 .status(200)
//                 .cookie("accessToken", accessToken, cookieOptions)
//                 .cookie("refreshToken", refreshToken, cookieOptions)
//                 .json(
//                     new ApiResponse(200, {
//                         user: employeeDetails,
//                         accessToken,
//                         refreshToken,
//                     })
//                 );
//         }
//     );
// });

export const loginEmployee = asyncHandler(async (req, res) => {
    const { employeeEmail, employeePassword } = req.body;
    console.log("Login attempt for:", employeeEmail);
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log("New Password:", hashedPassword);
    // Find employee by email
    connection.query(
        "SELECT * FROM employee WHERE employeeEmail = ?",
        [employeeEmail],
        async (err, results) => {
            console.log("employee found");
            console.log("Error:",err);
            console.log("result:",results.length);
            if (err || results.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const employee = results[0];
            console.log(employee);
            // Check if the password matches
            console.log("Password to compare:", employeePassword);
            console.log("Hashed password from DB:", employee.employeePassword);
            const isPasswordValid = await bcrypt.compare(employeePassword, employee.employeePassword);
            console.log(isPasswordValid)
            if (!isPasswordValid) {
                console.log("Invalid password attempt for employee: Comparison Failed", employeeEmail);
                return res.status(401).json({ message: "Invalid email or password" });
            }

            console.log("Password is valid for employee:", isPasswordValid);

            // Generate access and refresh tokens
            const { accessToken, refreshToken } = await generateAccessAndRefreshToken(employee.employeeId);
            console.log(accessToken.length, refreshToken.length)

            // Update refresh token in the database
            try {
                await connection.promise().query(
                    "UPDATE employee SET employeeRefreshToken = ? WHERE employeeId = ?",
                    [refreshToken, employee.employeeId]
                );
            } catch (error) {
                console.error("Error updating refresh token:", error.message);
                return res.status(500).json(
                    new ApiResponse(500, {}, "Error while updating refresh token")
                );
            }

            // Fetch employee details without sensitive information
            const [employeeData] = await connection.promise().query(
                `SELECT 
                    e.employeeId,
                    e.customEmployeeId, 
                    e.employeeName, 
                    e.companyName, 
                    e.employeeQualification, 
                    e.experienceInYears, 
                    e.employeeDOB, 
                    e.employeeJoinDate, 
                    e.employeeGender, 
                    e.employeePhone, 
                    e.employeeEmail, 
                    e.employeeAccess, 
                    e.createdAt,
                    e.employeeEndDate, 
                    d.departmentId,
                    d.departmentName,
                    ds.designationId,
                    ds.designationName,
                    m.employeeName AS managerName
                FROM 
                    employee e
                LEFT JOIN 
                    employeeDesignation ed ON e.employeeId = ed.employeeId
                LEFT JOIN 
                    department d ON ed.departmentId = d.departmentId
                LEFT JOIN 
                    designation ds ON ed.designationId = ds.designationId
                LEFT JOIN 
                    employee m ON ed.managerId = m.employeeId
                WHERE 
                    e.employeeId = ?;`,
                [employee.employeeId]
            );

            if (employeeData.length === 0) {
                return res
                    .status(404)
                    .json({ message: "Employee not found after login." });
            }

            const employeeDetails = employeeData[0];

            // Fetch job profiles (department, designation, manager)
            const [jobProfiles] = await connection.promise().query(
                `SELECT 
                    ds.designationId, 
                    ds.designationName, 
                    d.departmentId,
                    d.departmentName, 
                    m.employeeName AS managerName
                FROM 
                    employeeDesignation ed
                LEFT JOIN 
                    department d ON ed.departmentId = d.departmentId
                LEFT JOIN 
                    designation ds ON ed.designationId = ds.designationId
                LEFT JOIN 
                    employee m ON ed.managerId = m.employeeId
                WHERE 
                    ed.employeeId = ?;`,
                [employee.employeeId]
            );

            // Set accessToken as an HTTP-only cookie
            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: "None",
            };

            // Respond with employee details and job profiles
            return res
                .status(200)
                .cookie("accessToken", accessToken, cookieOptions)
                .cookie("refreshToken", refreshToken, cookieOptions)
                .json(
                    new ApiResponse(200, {
                        employee: employeeDetails,
                        jobProfiles: jobProfiles,
                        accessToken,
                        refreshToken,
                    })
                );
        }
    );
});

export const logoutEmployee = asyncHandler(async (req, res) => {
    try {

        // Remove the refreshToken from the database for the logged-in user
        await connection.promise().query(
            'UPDATE employee SET employeeRefreshToken = NULL WHERE employeeId = ?',
            [req.body.employeeId]
        );

        // Clear the cookies for accessToken and refreshToken
        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({status: 200, message: "User logged out"});
    } catch (error) {
        console.error("Error logging out user:", error.message);
        return res.status(500).json({status: 500, message: "Error logging out user"});
    }
});

export const addEmployee = asyncHandler(async (req, res) => {
    const employee = req.body;

    // Check if customEmployeeId is unique
    const checkForCustomIdQuery = `SELECT * FROM employee WHERE customEmployeeId = ?`;
    const [checkingCustomIdResult] = await connection.promise().query(checkForCustomIdQuery, [employee.employee.customEmployeeId]);

    if (checkingCustomIdResult.length > 0) {
        return res
            .status(400)
            .json(
                new ApiError(400, 'CustomEmployeeID should be unique', ['CustomEmployeeID should be unique'])
            );
    }

    // Hash the password asynchronously
    const hashedPassword = await bcrypt.hash(employee.employee.employeePassword, 10);

    // Insert the employee into the employee table
    const insertEmployeeQuery = `
        INSERT INTO employee 
        (customEmployeeId, employeeName, companyName, employeeQualification, experienceInYears, 
         employeeDOB, employeeJoinDate, employeeGender, employeePhone, employeeEmail, 
         employeePassword, employeeAccess) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const employeeData = [
        employee.employee.customEmployeeId,
        employee.employee.employeeName,
        employee.employee.companyName,
        employee.employee.employeeQualification,
        employee.employee.experienceInYears,
        employee.employee.employeeDOB,
        employee.employee.employeeJoinDate,
        employee.employee.employeeGender,
        employee.employee.employeePhone,
        employee.employee.employeeEmail,
        hashedPassword, // Use hashed password here
        employee.employee.employeeAccess,
    ];

    const [result] = await connection.promise().query(insertEmployeeQuery, employeeData);
    const employeeId = result.insertId;

    // Insert job profiles into employeedesignation table
    const jobProfiles = [];
    for (const profile of employee.jobProfiles) {
        let {designationId, designationName, departmentId, managerId} = profile;

        console.log(designationId, designationName, departmentId, managerId)

        if (!departmentId) {
            return res.status(400).json({message: 'Department ID is required.'});
        }

        // Insert designation if designationId is 0
        if (designationId === 0) {
            const insertQuery = `INSERT INTO designation (designationName) VALUES (?);`;

            const [designationInsertResult] = await connection
                .promise()
                .query(insertQuery, [designationName]);
            designationId = designationInsertResult.insertId;
        }

        // Insert job profile for the employee
        const insertJobProfileQuery = `INSERT INTO employeedesignation (employeeId, designationId, departmentId, managerId) VALUES (?, ?, ?, ?)`;
        await connection.promise().query(insertJobProfileQuery, [
            employeeId,
            designationId,
            departmentId,
            managerId,
        ]);

        jobProfiles.push({
            designationId,
            designationName,
            departmentId,
            managerId,
        });
    }

    // Fetch the newly inserted employee data
    const fetchEmployeeQuery = `
        SELECT * FROM employee WHERE employeeId = ?
    `;
    const [employeeResult] = await connection.promise().query(fetchEmployeeQuery, [employeeId]);

    const newEmployeeDetails = employeeResult[0];

    // Respond with the full employee details, including job profiles
    res.status(201).json(
        new ApiResponse(201, {
            employee: newEmployeeDetails,
            jobProfiles,
        }, 'Employee and job profiles added successfully.')
    );
});

export const deleteEmployee = asyncHandler(async (req, res) => {
    const {employeeId} = req.body;
    console.log("called")
    if (!employeeId) {
        return res.status(400).json({message: "Employee ID is required"});
    }

    // Check if the employee exists
    const checkEmployeeQuery = "SELECT * FROM employee WHERE employeeId = ?";
    const [employee] = await connection.promise().query(checkEmployeeQuery, [employeeId]);

    if (employee.length === 0) {
        return res.status(404).json({message: "Employee not found"});
    }

    // Update employeeEndDate to CURRENT_DATE
    const updateEmployeeQuery = "UPDATE employee SET employeeEndDate = CURRENT_DATE WHERE employeeId = ?";
    await connection.promise().query(updateEmployeeQuery, [employeeId]);

    res.status(200).json({message: "Employee successfully deactivated"});
});

// export const updateEmployee = asyncHandler(async (req, res) => {
//     const {employeeId, updates, jobProfiles} = req.body;
//
//     if (!employeeId || (!updates && !jobProfiles)) {
//         return res.status(400).json({message: "Employee ID, updates, or jobProfiles are required"});
//     }
//
//     // Check if the employee exists
//     const checkEmployeeQuery = "SELECT * FROM employee WHERE employeeId = ?";
//     const [employee] = await connection.promise().query(checkEmployeeQuery, [employeeId]);
//
//     if (employee.length === 0) {
//         return res.status(404).json({message: "Employee not found"});
//     }
//
//     // 1. Update the employee table
//     if (updates) {
//         const fieldsToUpdate = [];
//         const values = [];
//
//         for (const key in updates) {
//             if (updates.hasOwnProperty(key)) {
//                 fieldsToUpdate.push(`${key} = ?`);
//                 values.push(updates[key]);
//             }
//         }
//
//         // Add the employeeId at the end for the WHERE clause
//         values.push(employeeId);
//
//         const updateQuery = `UPDATE employee SET ${fieldsToUpdate.join(", ")} WHERE employeeId = ?`;
//         await connection.promise().query(updateQuery, values);
//     }
//
//     // 2. Update job profiles (employeedesignation table)
//     if (jobProfiles && Array.isArray(jobProfiles)) {
//         for (const profile of jobProfiles) {
//             const {designationId, designationName, departmentId, managerId, operation} = profile;
//
//             if (!departmentId) {
//                 return res.status(400).json({message: "Department ID is required for job profile update."});
//             }
//
//             if (operation === "update") {
//                 // Update existing job profile
//                 const updateJobProfileQuery = `
//                     UPDATE employeedesignation
//                     SET designationId = ?, departmentId = ?, managerId = ?
//                     WHERE employeeId = ? AND designationId = ?`;
//                 await connection.promise().query(updateJobProfileQuery, [designationId, departmentId, managerId, employeeId, designationId]);
//             } else if (operation === "add") {
//                 // Add new job profile
//                 const insertJobProfileQuery = `
//                     INSERT INTO employeedesignation (employeeId, designationId, departmentId, managerId)
//                     VALUES (?, ?, ?, ?)`;
//                 await connection.promise().query(insertJobProfileQuery, [employeeId, designationId, departmentId, managerId]);
//             } else if (operation === "delete") {
//                 // Delete job profile
//                 const deleteJobProfileQuery = `
//                     DELETE FROM employeedesignation
//                     WHERE employeeId = ? AND designationId = ?`;
//                 await connection.promise().query(deleteJobProfileQuery, [employeeId, designationId]);
//             }
//         }
//     }
//
//     res.status(200).json({message: "Employee and job profiles updated successfully"});
// });

export const editEmployeeWithRelations = asyncHandler(async (req, res) => {
    const { id } = req.params; // employeeId from URL
    const { employee, jobProfiles } = req.body;


    console.log(employee)


    console.log(id);

    // Validate required fields in employee object
    if (
        !employee.customEmployeeId ||
        !employee.employeeName ||
        !employee.companyName ||
        !employee.employeeGender ||
        !employee.employeeEmail
    ) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    try {
        // Update the employee table
        const updateEmployeeQuery =
            `UPDATE employee 
            SET 
              customEmployeeId = ?, 
              employeeName = ?, 
              companyName = ?, 
              employeeQualification = ?, 
              experienceInYears = ?, 
              employeeDOB = ?, 
              employeeJoinDate = ?, 
              employeeGender = ?, 
              employeePhone = ?, 
              employeeEmail = ?, 
              employeeAccess = ?,
              employeeEndDate = ? 
            WHERE employeeId = ?`;

        const employeeValues = [
            employee.customEmployeeId,
            employee.employeeName,
            employee.companyName,
            employee.employeeQualification,
            employee.experienceInYears,
            employee.employeeDOB,
            employee.employeeJoinDate,
            employee.employeeGender,
            employee.employeePhone,
            employee.employeeEmail,
            employee.employeeAccess,
            employee.employeeEndDate,
            id,
        ];

        const [employeeResult] = await connection.promise().query(updateEmployeeQuery, employeeValues);

        if (employeeResult.affectedRows === 0) {
            throw new Error('Employee not found.');
        }

        // Handle jobProfiles only if not empty
        // if (jobProfiles && jobProfiles.length > 0) {
        //     // Delete existing job profiles for the employee
        //     const deleteProfilesQuery = `DELETE FROM employeedesignation WHERE employeeId = ?`;
        //     await connection.promise().query(deleteProfilesQuery, [id]);
        //
        //     // Insert new job profiles into employeedesignation table
        //     const insertProfilesQuery =
        //         `INSERT INTO employeedesignation (employeeId, designationId, departmentId, managerId)
        //         VALUES (?, ?, ?, ?)`;
        //
        //     for (const profile of jobProfiles) {
        //         const profileValues = [id, profile.designationId, profile.departmentId, profile.managerId];
        //         await connection.promise().query(insertProfilesQuery, profileValues);
        //     }
        // }

        res.status(200).json({ message: 'Employee updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




export const getAllEmployees = asyncHandler(async (req, res) => {
    const query = `
    SELECT 
        e.employeeId,
        e.customEmployeeId, 
        e.employeeName, 
        e.companyName, 
        e.employeeQualification, 
        e.experienceInYears, 
        e.employeeDOB, 
        e.employeeJoinDate, 
        e.employeeGender, 
        e.employeePhone, 
        e.employeeEmail, 
        e.employeeAccess, 
        e.createdAt,
        e.employeeEndDate, 
        d.departmentName, 
        ds.designationName, 
        m.employeeName AS managerName
    FROM 
        employee e
    LEFT JOIN 
        employeeDesignation ed ON e.employeeId = ed.employeeId
    LEFT JOIN 
        department d ON ed.departmentId = d.departmentId
    LEFT JOIN 
        designation ds ON ed.designationId = ds.designationId
    LEFT JOIN 
        employee m ON ed.managerId = m.employeeId
    WHERE 
        e.employeeEndDate IS NULL;
`;


    connection.query(query, (err, results) => {
        if (err) {
            throw new Error("Error fetching employees: " + err.message);
        }

        // Group the results
        const employeesMap = {};

        // console.log(results)

        results.forEach((row) => {
            const customEmployeeId = row.customEmployeeId;

            if (!employeesMap[customEmployeeId]) {
                // Initialize the employee object if not already present
                employeesMap[customEmployeeId] = {
                    employee: {
                        employeeId: row.employeeId,
                        customEmployeeId: row.customEmployeeId,
                        employeeName: row.employeeName,
                        companyName: row.companyName,
                        employeeQualification: row.employeeQualification,
                        experienceInYears: row.experienceInYears,
                        employeeDOB: row.employeeDOB,
                        employeeJoinDate: row.employeeJoinDate,
                        employeeGender: row.employeeGender,
                        employeePhone: row.employeePhone,
                        employeeEmail: row.employeeEmail,
                        employeeAccess: row.employeeAccess,
                        createdAt: row.createdAt,
                        employeeEndDate: row.employeeEndDate,
                    },
                    jobProfiles: [],
                };
            }

            // Add the job profile to the employee's jobProfiles array
            if (row.designationName || row.departmentName || row.managerName) {
                employeesMap[customEmployeeId].jobProfiles.push({
                    designationName: row.designationName,
                    departmentName: row.departmentName,
                    managerName: row.managerName,
                });
            }
        });

        // Convert the map to an array of grouped objects
        const employees = Object.values(employeesMap);
        // console.log(employees)

        res.status(200).json(employees);
    });
});