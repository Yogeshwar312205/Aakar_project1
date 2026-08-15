import asyncHandler from "../utils/asyncHandler.js";
import {connection} from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addDesignation = asyncHandler(async (req, res) => {
    console.log('🔵 addDesignation called');
    console.log('Request body:', req.body);
    
    const {designationName} = req.body;

    console.log('Extracted designationName:', designationName);

    // Validate designation name
    if (!designationName || !designationName.trim()) {
        return res.status(400).json(new ApiError(400, 'Designation name is required.', ['Designation name is required.']));
    }

    const normalizedDesignationName = designationName.trim();

    // Create slug: lowercase, remove special chars, replace spaces with hyphens
    const designationSlug = normalizedDesignationName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with hyphens

    console.log('Generated slug:', designationSlug);

    if (!designationSlug) {
        return res.status(400).json(new ApiError(400, 'Designation name must include letters or numbers.', ['Designation name must include letters or numbers.']));
    }

    try {
        // Check if designationSlug column exists, if not, add it
        const [columns] = await connection.promise().query(
            "SHOW COLUMNS FROM designation LIKE 'designationSlug'"
        );

        if (columns.length === 0) {
            console.log('⚠️ designationSlug column does not exist, adding it...');
            await connection.promise().query(
                "ALTER TABLE designation ADD COLUMN designationSlug VARCHAR(50) DEFAULT '' AFTER designationName"
            );
            console.log('✅ designationSlug column added successfully');
        }

        // Check for existing designation with same slug
        const checkForExistenceQuery = `SELECT * FROM designation WHERE designationSlug = ?`;
        const [checkForExistenceQueryResult] = await connection.promise().query(checkForExistenceQuery, [designationSlug]);

        if(checkForExistenceQueryResult.length > 0) {
            return res.status(409).json(new ApiError(409, 'Designation already exists.', ['Designation already exists.']));
        }

        // Insert the new designation
        const insertQuery = "INSERT INTO designation (designationName, designationSlug, access) VALUES (?, ?, ?);";

        connection.query(insertQuery, [normalizedDesignationName, designationSlug, ''], (err, result, fields) => {
            if (err) {
                console.error('❌ MySQL Error inserting designation:', err);
                console.error('Error code:', err.code);
                console.error('Error message:', err.sqlMessage);
                console.error('SQL State:', err.sqlState);
                res.status(400).json(new ApiError(400, "Error while adding designation", [err.sqlMessage || 'Error while adding designation']));
                return;
            }

            console.log('✅ Designation added successfully, ID:', result.insertId);

            res.status(201).json(new ApiResponse(201, {
                designationId: result.insertId, 
                designationName: normalizedDesignationName, 
                designationSlug
            }, "Designation added successfully."));
        });
    } catch (error) {
        console.error('❌ Error in addDesignation:', error);
        return res.status(500).json(new ApiError(500, 'Internal server error', [error.message]));
    }
});


export const getAllDesignations = asyncHandler(async (req, res) => {
    const selectQuery = "SELECT * FROM designation";

    connection.query(selectQuery, (err, result, fields) => {
        if (err) {
            res.status(400).json(new ApiError(400, "Error while fetching designations", ['Error while fetching designations']));
        }

        res.status(200).json(new ApiResponse(200, result, "Designations fetched successfully"));
    });
});


export const updateDesignation = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { designationName } = req.body;

    console.log(id, designationName);

    // Corrected the UPDATE query
    const updateQuery = "UPDATE designation SET designationName = ? WHERE designationId = ?;";

    connection.query(updateQuery, [designationName, id], (err, result, fields) => {
        if (err) {
            return res.status(400).json(new ApiError(400, "Error while updating designation", ['Error while updating designation']));
        }

        // Returning the updated designation in the response
        if (result.affectedRows > 0) {
            console.log(result)
            res.status(200).json(new ApiResponse(200, { designationId: id, designationName }, "Designation updated successfully"));
        } else {
            res.status(404).json(new ApiError(404, "Designation not found", ['Designation not found']));
        }
    });
});
