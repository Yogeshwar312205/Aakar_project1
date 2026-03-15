import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { connection } from "../db/index.js";

// Add BOM Design
const addBomDesign = asyncHandler(async (req, res) => {
    const {
        itemCode, itemName, specification,
        ELength, EWidth, EHeight, EQuantity,
        ALength, AWidth, AHeight, AQuantity,
        projectNumber, stageId
    } = req.body;

    if (!itemCode || !itemName || !projectNumber || !stageId) {
        return res.status(400).json(
            new ApiError(400, 'Item code, name, project number, and stage are required.')
        );
    }

    connection.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ statusCode: 500, success: false, message: `Error starting transaction: ${err.message}` });
        }

        const insertItemQuery = `
            INSERT INTO itemmaster (itemCode, itemName, specification)
            VALUES (?, ?, ?)
        `;

        connection.query(insertItemQuery, [itemCode, itemName, specification || null], (insertItemError, itemResult) => {
            if (insertItemError) {
                return connection.rollback(() => {
                    return res.status(500).json({ statusCode: 500, success: false, message: `Error inserting item into itemmaster: ${insertItemError.sqlMessage || insertItemError.message}` });
                });
            }

            const lastItemId = itemResult.insertId;

            const insertBomDetailsQuery = `
                INSERT INTO bomdetails
                (itemId, ELength, EWidth, EHeight, EQuantity, ALength, AWidth, AHeight, AQuantity, projectNumber, stageId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(
                insertBomDetailsQuery,
                [lastItemId, ELength || null, EWidth || null, EHeight || null, EQuantity || null,
                 ALength || null, AWidth || null, AHeight || null, AQuantity || null,
                 projectNumber, stageId],
                (insertBomError) => {
                    if (insertBomError) {
                        return connection.rollback(() => {
                            return res.status(500).json({ statusCode: 500, success: false, message: `Error inserting into bomdetails: ${insertBomError.sqlMessage || insertBomError.message}` });
                        });
                    }

                    connection.commit((commitError) => {
                        if (commitError) {
                            return connection.rollback(() => {
                                return res.status(500).json({ statusCode: 500, success: false, message: `Error committing transaction: ${commitError.message}` });
                            });
                        }
                        res.status(200).json(new ApiResponse(200, { itemId: lastItemId, projectNumber }, 'BOM Design added successfully.'));
                    });
                }
            );
        });
    });
});

// Fetch BOM Details by Project Number (with stage info)
const fetchBomDetailsByProjectNumber = asyncHandler(async (req, res) => {
    const { projectNumber } = req.params;
    if (!projectNumber) {
        return res.status(400).json(new ApiError(400, 'Project number is required'));
    }

    const fetchBomDetailsQuery = `
        SELECT
            bd.bomId, bd.itemId, bd.ELength, bd.EWidth, bd.EHeight, bd.EQuantity,
            bd.ALength, bd.AWidth, bd.AHeight, bd.AQuantity,
            bd.projectNumber, bd.stageId,
            im.itemCode, im.itemName, im.specification
        FROM bomdetails AS bd
        JOIN itemmaster AS im ON bd.itemId = im.itemId
        WHERE bd.projectNumber = ?
        ORDER BY bd.bomId
    `;

    connection.query(fetchBomDetailsQuery, [projectNumber], (err, data) => {
        if (err) {
            return res.status(500).json(new ApiError(500, `Error fetching BOM details: ${err.sqlMessage || err.message}`));
        }

        if (data.length === 0) {
            return res.status(200).json(new ApiResponse(200, [], 'No BOM details found for the given project number'));
        }

        res.status(200).json(new ApiResponse(200, data, 'BOM details fetched successfully.'));
    });
});

// Fetch BOM Details by Item ID
const fetchBomDetailsByItemId = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json(new ApiError(400, 'Item ID is required'));
    }

    const fetchBomDetailsQuery = `
        SELECT
            bd.bomId, bd.itemId, bd.ELength, bd.EWidth, bd.EHeight, bd.EQuantity,
            bd.ALength, bd.AWidth, bd.AHeight, bd.AQuantity,
            bd.projectNumber, bd.stageId,
            im.itemCode, im.itemName, im.specification
        FROM bomdetails bd
        JOIN itemmaster im ON bd.itemId = im.itemId
        WHERE bd.itemId = ?
    `;

    connection.query(fetchBomDetailsQuery, [itemId], (err, data) => {
        if (err) {
            return res.status(500).json(new ApiError(500, 'Error fetching BOM details'));
        }
        if (data.length === 0) {
            return res.status(404).json(new ApiError(404, 'No BOM details found for the given item ID'));
        }
        return res.status(200).json(new ApiResponse(200, data, 'BOM details fetched successfully.'));
    });
});

// Update BOM Design
const updateBomDesign = asyncHandler(async (req, res) => {
    const { bomId } = req.params;
    const {
        itemCode, itemName, specification, material, grade,
        ELength, EWidth, EHeight, EQuantity,
        ALength, AWidth, AHeight, AQuantity,
        projectNumber, itemId, stageId
    } = req.body;

    if (!bomId || !projectNumber || !itemId || !stageId) {
        return res.status(400).json(new ApiError(400, "Item ID, bom id, project number, and stage are required."));
    }

    const updateItemQuery = `
        UPDATE itemmaster
        SET itemCode = ?, itemName = ?, specification = ?
        WHERE itemId = ?
    `;

    connection.query(updateItemQuery, [itemCode, itemName, specification || null, itemId], (err) => {
        if (err) {
            return res.status(500).json(new ApiError(500, `Error updating item in itemmaster: ${err.sqlMessage || err.message}`));
        }

        const updateBomDetailsQuery = `
            UPDATE bomdetails
            SET ELength = ?, EWidth = ?, EHeight = ?, EQuantity = ?,
                ALength = ?, AWidth = ?, AHeight = ?, AQuantity = ?,
                projectNumber = ?, stageId = ?
            WHERE bomId = ?
        `;

        connection.query(
            updateBomDetailsQuery,
            [ELength || null, EWidth || null, EHeight || null, EQuantity || null,
             ALength || null, AWidth || null, AHeight || null, AQuantity || null,
             projectNumber, stageId, bomId],
            (err) => {
                if (err) {
                    return res.status(500).json(new ApiError(500, `Error updating BOM details: ${err.sqlMessage || err.message}`));
                }
                res.status(200).json(new ApiResponse(200, 'BOM design updated successfully.'));
            }
        );
    });
});

// Delete BOM Design
const deleteBomDesign = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json(new ApiError(400, "Item ID is required."));
    }

    const deleteBomDetailsQuery = `DELETE FROM bomdetails WHERE itemId = ?`;
    connection.query(deleteBomDetailsQuery, [itemId], (err) => {
        if (err) {
            return res.status(500).json(new ApiError(500, "Error deleting BOM details."));
        }

        const deleteItemMasterQuery = `DELETE FROM itemmaster WHERE itemId = ?`;
        connection.query(deleteItemMasterQuery, [itemId], (err) => {
            if (err) {
                return res.status(500).json(new ApiError(500, "Error deleting item in itemmaster."));
            }
            res.status(200).json(new ApiResponse(200, "BOM design deleted successfully."));
        });
    });
});

// Import BOM items from another project
const importBomFromProject = asyncHandler(async (req, res) => {
    const { sourceProjectNumber, targetProjectNumber, targetStageId, bomIds } = req.body;

    if (!sourceProjectNumber || !targetProjectNumber || !bomIds || !Array.isArray(bomIds) || bomIds.length === 0) {
        return res.status(400).json(new ApiError(400, 'Source project, target project, and bomIds are required.'));
    }

    try {
        const [sourceItems] = await connection.promise().query(
            `SELECT bd.*, im.itemCode, im.itemName, im.specification
             FROM bomdetails bd
             JOIN itemmaster im ON bd.itemId = im.itemId
             WHERE bd.projectNumber = ? AND bd.bomId IN (?)`,
            [sourceProjectNumber, bomIds]
        );

        if (sourceItems.length === 0) {
            return res.status(404).json(new ApiError(404, 'No matching BOM items found in source project.'));
        }

        await connection.promise().beginTransaction();

        for (const item of sourceItems) {
            const [itemResult] = await connection.promise().query(
                `INSERT INTO itemmaster (itemCode, itemName, specification)
                 VALUES (?, ?, ?)`,
                [item.itemCode, item.itemName, item.specification]
            );

            const newItemId = itemResult.insertId;

            await connection.promise().query(
                `INSERT INTO bomdetails
                 (itemId, ELength, EWidth, EHeight, EQuantity, ALength, AWidth, AHeight, AQuantity, projectNumber, stageId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newItemId, item.ELength, item.EWidth, item.EHeight, item.EQuantity,
                 item.ALength, item.AWidth, item.AHeight, item.AQuantity,
                 targetProjectNumber, targetStageId]
            );
        }

        await connection.promise().commit();
        res.status(200).json(new ApiResponse(200, { imported: sourceItems.length }, 'BOM items imported successfully.'));
    } catch (err) {
        await connection.promise().rollback();
        return res.status(500).json(new ApiError(500, 'Error importing BOM items.'));
    }
});

export {
    addBomDesign,
    fetchBomDetailsByProjectNumber,
    fetchBomDetailsByItemId,
    updateBomDesign,
    deleteBomDesign,
    importBomFromProject
};
