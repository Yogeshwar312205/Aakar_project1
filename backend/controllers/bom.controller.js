import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import { connection } from "../db/index.js";

// Add BOM Design
const addBomDesign = asyncHandler(async (req, res) => {
    const {
        itemCode,
        itemName,
        specification,
        ELength,
        EWidth,
        EHeight,
        EQuantity,
        ALength,
        AWidth,
        AHeight,
        AQuantity,
        projectNumber
    } = req.body;

    if (!itemCode || !itemName || !specification || !projectNumber) {
        return res.status(400).json(
            new ApiError(400, 'Item code, name, specification, and project number are required.')
        );
    }

    connection.beginTransaction((err) => {
        if (err) {
            console.error('Transaction Start Error:', err);
            return res.status(500).json(
                new ApiError(500, 'Error starting transaction.')
            );
        }

        const insertItemQuery = `
            INSERT INTO inventory.itemmaster (itemCode, itemName, specification) 
            VALUES (?, ?, ?)
        `;

        connection.query(insertItemQuery, [itemCode, itemName, specification], (insertItemError, itemResult) => {
            if (insertItemError) {
                return connection.rollback(() => {
                    console.error('Database Insert Item Error:', insertItemError);
                    return res.status(500).json(
                        new ApiError(500, 'Error inserting item into itemmaster.')
                    );
                });
            }

            const lastItemId = itemResult.insertId;

            const insertBomDetailsQuery = `
                INSERT INTO inventory.bomdetails (itemId, ELength, EWidth, EHeight, EQuantity, ALength, AWidth, AHeight, AQuantity, projectNumber) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(
                insertBomDetailsQuery,
                [lastItemId, ELength, EWidth, EHeight, EQuantity, ALength, AWidth, AHeight, AQuantity, projectNumber],
                (insertBomError) => {
                    if (insertBomError) {
                        return connection.rollback(() => {
                            console.error('Database Insert BOM Details Error:', insertBomError);
                            return res.status(500).json(
                                new ApiError(500, 'Error inserting into bomdetails.')
                            );
                        });
                    }

                    connection.commit((commitError) => {
                        if (commitError) {
                            return connection.rollback(() => {
                                console.error('Commit Error:', commitError);
                                return res.status(500).json(
                                    new ApiError(500, 'Error committing transaction.')
                                );
                            });
                        }

  
                            res.status(200).json(new ApiResponse(200, { itemId: lastItemId, projectNumber }, 'BOM Design added successfully.'));
                    });
                }
            );
        });
    });
});


// Fetch BOM Details by Project Number
 const fetchBomDetailsByProjectNumber = asyncHandler(async (req, res) => {
    const { projectNumber } = req.params; 
    console.log("Project Number:", projectNumber);
    if (!projectNumber) {
        return res.status(400).json(
            new ApiError(400, 'Project number is required')
        );
    }

    const fetchBomDetailsQuery = `
       SELECT 
   
    bd.ELength, 
    bd.EWidth, 
    bd.EHeight, 
    bd.EQuantity, 
    bd.ALength, 
    bd.AWidth, 
    bd.AHeight, 
    bd.AQuantity, 
    bd.projectNumber, 
    im.itemCode, 
    im.itemName, 
    im.specification, 
    im.itemId
FROM inventory.bomdetails AS bd
JOIN inventory.itemmaster AS im 
    ON bd.itemId = im.itemId
WHERE bd.projectNumber = ?;

    `;

    connection.query(fetchBomDetailsQuery, [projectNumber], (err, data) => {
        if (err) {
            console.error('Error fetching BOM details:', err);
            return res.status(500).json(
                new ApiError(500, 'Error fetching BOM details')
            );
        }

        if (data.length === 0) {
            return res.status(200).json(
                new ApiError(200, 'No BOM details found for the given project number')
            );
        }

        res.status(200).json(
            new ApiResponse(200, data, 'BOM details fetched successfully.')
        );
    });
});


// Fetch BOM Details by Item ID
const fetchBomDetailsByItemId = asyncHandler(async (req, res) => {
    const { itemId } = req.params; 

    if (!itemId) {
        return res.status(400).json(
            new ApiError(400, 'Item ID is required')
        );
    }

    const fetchBomDetailsQuery = `
        SELECT 
            bd.itemId, 
            bd.ELength, bd.EWidth, bd.EHeight, bd.EQuantity, 
            bd.ALength, bd.AWidth, bd.AHeight, bd.AQuantity, 
            bd.projectNumber, 
            im.itemCode, im.itemName, im.specification 
        FROM inventory.bomdetails bd
        JOIN inventory.itemmaster im ON bd.itemId = im.itemId
        WHERE bd.itemId = ?
    `;

    connection.query(fetchBomDetailsQuery, [itemId], (err, data) => {
        if (err) {
            console.error('Error fetching BOM details:', err);
            return res.status(500).json(
                new ApiError(500, 'Error fetching BOM details')
            );
        }

        if (data.length === 0) {
            return res.status(404).json(
                new ApiError(404, 'No BOM details found for the given item ID')
            );
        }

        return res.status(200).json(
            new ApiResponse(200, data, 'BOM details fetched successfully.')
        );
    });
});

// Update BOM Design
const updateBomDesign = asyncHandler(async (req, res) => {
    const { bomId} = req.params;
    const {
        itemCode,
        itemName,
        specification,
        ELength,
        EWidth,
        EHeight,
        EQuantity,
        ALength,
        AWidth,
        AHeight,
        AQuantity,
        projectNumber,
        itemId
    } = req.body;
    
    if (!bomId || !projectNumber||!itemId) {
        return res.status(400).json(
            new ApiError(400, "Item ID ,bom id and project number are required.")
        );
    }
    
    const updateBomDesignQuery = `
        UPDATE inventory.itemmaster
        SET itemCode = ?, itemName = ?, specification = ?
        WHERE itemId = ?
    `;
    
    connection.query(
        updateBomDesignQuery,
        [itemCode, itemName, specification, itemId],
        (err) => {
            if (err) {
                console.error('Error updating item in itemmaster:', err);
                return res.status(500).json(
                    new ApiError(500, 'Error updating item in itemmaster.')
                );
            }
            
            const updateBomDetailsQuery = `
                UPDATE inventory.bomdetails
                SET ELength = ?, EWidth = ?, EHeight = ?, EQuantity = ?, 
                ALength = ?, AWidth = ?, AHeight = ?, AQuantity = ?, 
                projectNumber = ?
                WHERE bomId = ?
            `;
            
            connection.query(
                updateBomDetailsQuery,
                [ELength, EWidth, EHeight, EQuantity, ALength, AWidth, AHeight, AQuantity, projectNumber, bomId],
                (err) => {
                    if (err) {
                        console.error('Error updating BOM details:', err);
                        return res.status(500).json(
                            new ApiError(500, 'Error updating BOM details.')
                        );
                    }
                    
                    res.status(200).json(
                        new ApiResponse(200, 'BOM design updated successfully.')
                    );
                }
            );
        }
    );
});

// Delete BOM Design
const deleteBomDesign = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!itemId) {
        return res.status(400).json(
            new ApiError(400, "Item ID is required.")
        );
    }

    const deleteBomDetailsQuery = `
        DELETE FROM inventory.bomdetails
        WHERE itemId = ?
    `;

    connection.query(deleteBomDetailsQuery, [itemId], (err) => {
        if (err) {
            console.error("Error deleting BOM details:", err);
            return res.status(500).json(
                new ApiError(500, "Error deleting BOM details.")
            );
        }

        const deleteItemMasterQuery = `
            DELETE FROM inventory.itemmaster
            WHERE itemId = ?
        `;

        connection.query(deleteItemMasterQuery, [itemId], (err) => {
            if (err) {
                console.error("Error deleting item in itemmaster:", err);
                return res.status(500).json(
                    new ApiError(500, "Error deleting item in itemmaster.")
                );
            }

            res.status(200).json(
                new ApiResponse(200, "BOM design deleted successfully.")
            );
        });
    });
});



export {
    addBomDesign,
    fetchBomDetailsByProjectNumber,
    fetchBomDetailsByItemId,
    updateBomDesign,
    deleteBomDesign
};
