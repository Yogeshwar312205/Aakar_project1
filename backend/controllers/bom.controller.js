import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { connection } from "../db/index.js";
import * as XLSX from "xlsx";

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

    if (!targetStageId) {
        return res.status(400).json(new ApiError(400, 'Target stage is required for import.'));
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

        // Check for duplicate itemCodes in target stage
        const sourceItemCodes = sourceItems.map((item) => item.itemCode);
        const [existingItems] = await connection.promise().query(
            `SELECT im.itemCode
             FROM itemmaster im
             JOIN bomdetails bd ON im.itemId = bd.itemId
             WHERE bd.projectNumber = ? AND bd.stageId = ?
             AND im.itemCode IN (?)`,
            [targetProjectNumber, targetStageId, sourceItemCodes]
        );

        if (existingItems.length > 0) {
            const duplicateItems = existingItems.map((r) => r.itemCode).join(', ');
            return res.status(400).json(
                new ApiError(400, `Items already exist in this stage: ${duplicateItems}`)
            );
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
        return res.status(500).json(new ApiError(500, `Error importing BOM items: ${err.sqlMessage || err.message}`));
    }
});

// Helper: Build header map for key-based normalization
const buildHeaderMap = () => {
    return {
        'Item Code': 'itemCode',
        'item code': 'itemCode',
        'itemcode': 'itemCode',
        'itemCode': 'itemCode',
        'Item Name': 'itemName',
        'item name': 'itemName',
        'itemname': 'itemName',
        'itemName': 'itemName',
        'Specification': 'specification',
        'specification': 'specification',
        'Material': 'material',
        'material': 'material',
        'Grade': 'grade',
        'grade / type': 'grade',
        'grade/type': 'grade',
        'grade': 'grade',
        'GradeType': 'grade',
        'Length': 'ALength',
        'length': 'ALength',
        'ALength': 'ALength',
        'Width': 'AWidth',
        'width': 'AWidth',
        'AWidth': 'AWidth',
        'Height': 'AHeight',
        'height': 'AHeight',
        'AHeight': 'AHeight',
        'Quantity': 'AQuantity',
        'qty': 'AQuantity',
        'Qty': 'AQuantity',
        'quantity': 'AQuantity',
        'AQuantity': 'AQuantity',
        'Unit': 'unit',
        'unit': 'unit',
        'Weight': 'weight',
        'weight (kg)': 'weight',
        'Weight(Kg)': 'weight',
        'weight': 'weight',
        'Rate': 'rate',
        'rate': 'rate',
        'Remark': 'remark',
        'remark': 'remark'
    };
};

// Helper: Normalize Excel headers to camelCase
const normalizeExcelHeaders = (headers) => {
    const headerMap = {
        'Item Code': 'itemCode',
        'item code': 'itemCode',
        'itemcode': 'itemCode',
        'Item Name': 'itemName',
        'item name': 'itemName',
        'itemname': 'itemName',
        'Specification': 'specification',
        'specification': 'specification',
        'Material': 'material',
        'material': 'material',
        'Grade': 'grade',
        'grade / type': 'grade',
        'grade/type': 'grade',
        'grade': 'grade',
        'Length': 'ALength',
        'length': 'ALength',
        'Width': 'AWidth',
        'width': 'AWidth',
        'Height': 'AHeight',
        'height': 'AHeight',
        'Quantity': 'AQuantity',
        'qty': 'AQuantity',
        'quantity': 'AQuantity',
        'Unit': 'unit',
        'unit': 'unit',
        'Weight': 'weight',
        'weight (kg)': 'weight',
        'weight': 'weight',
        'Rate': 'rate',
        'rate': 'rate',
        'Remark': 'remark',
        'remark': 'remark'
    };

    return headers.map((h) => headerMap[h?.trim()] || h);
};

// Helper: Validate a single row
const validateImportRow = (row, rowNum, projectNumber, stageId) => {
    const errors = [];

    // Check required fields
    if (!row.itemCode || row.itemCode.toString().trim() === '') {
        errors.push(`Row ${rowNum}: itemCode is required`);
    }
    if (!row.itemName || row.itemName.toString().trim() === '') {
        errors.push(`Row ${rowNum}: itemName is required`);
    }
    if (row.AQuantity === null || row.AQuantity === undefined || row.AQuantity.toString().trim() === '') {
        errors.push(`Row ${rowNum}: Quantity is required`);
    }

    // Validate data types for numeric fields
    const numericFields = ['ALength', 'AWidth', 'AHeight', 'AQuantity', 'weight', 'rate'];
    numericFields.forEach((field) => {
        if (row[field] !== null && row[field] !== undefined && row[field] !== '') {
            const numVal = parseFloat(row[field]);
            if (isNaN(numVal)) {
                errors.push(`Row ${rowNum}: ${field} must be a valid number`);
            } else if (numVal < 0) {
                errors.push(`Row ${rowNum}: ${field} must be positive`);
            }
        }
    });

    return { isValid: errors.length === 0, errors };
};

// Import BOM from Excel file
const importBomFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(new ApiError(400, 'No file uploaded'));
    }

    const { projectNumber, stageId } = req.body;

    if (!projectNumber || !stageId) {
        return res.status(400).json(
            new ApiError(400, 'Project number and stage ID are required')
        );
    }

    const parsedStageId = parseInt(stageId, 10);
    if (isNaN(parsedStageId)) {
        return res.status(400).json(
            new ApiError(400, 'Stage ID must be a valid number')
        );
    }

    try {
        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
            return res.status(400).json(new ApiError(400, 'Excel file is empty'));
        }

        // Check row limit
        if (data.length > 150) {
            return res.status(400).json(
                new ApiError(400, `Cannot import more than 150 items. Found ${data.length} items.`)
            );
        }

        // Normalize headers using key-based mapping (not index-based)
        const headerMap = buildHeaderMap();
        const normalizedData = data.map((row) => {
            const normalizedRow = {};
            Object.entries(row).forEach(([key, value]) => {
                const normalizedKey = headerMap[key.trim()] || key;
                normalizedRow[normalizedKey] = value;
            });
            return normalizedRow;
        });

        // Validate all rows
        const validatedItems = [];
        const validationErrors = [];

        for (let i = 0; i < normalizedData.length; i++) {
            const row = normalizedData[i];
            const validation = validateImportRow(row, i + 1, projectNumber, parsedStageId);

            if (!validation.isValid) {
                validationErrors.push(...validation.errors);
            } else {
                validatedItems.push(row);
            }
        }

        // If there are validation errors, return them all
        if (validationErrors.length > 0) {
            return res.status(400).json(
                new ApiError(400, 'Validation failed', validationErrors)
            );
        }

        // Check for duplicates in batch
        const itemCodeSet = new Set();
        for (const item of validatedItems) {
            const key = `${item.itemCode}-${parsedStageId}`;
            if (itemCodeSet.has(key)) {
                return res.status(400).json(
                    new ApiError(400, `Duplicate item found: ${item.itemCode} in this batch`)
                );
            }
            itemCodeSet.add(key);
        }

        // Validate project and stage exist
        const [projectCheck] = await connection.promise().query(
            'SELECT projectNumber FROM project WHERE projectNumber = ?',
            [projectNumber]
        );

        if (projectCheck.length === 0) {
            return res.status(404).json(new ApiError(404, 'Project not found'));
        }

        const [stageCheck] = await connection.promise().query(
            'SELECT stageId FROM stage WHERE stageId = ? AND projectNumber = ?',
            [parsedStageId, projectNumber]
        );

        if (stageCheck.length === 0) {
            return res.status(404).json(new ApiError(404, 'Stage not found in this project'));
        }

        // Check for existing items in database (same itemCode + stageId)
        const itemCodes = validatedItems.map((item) => item.itemCode);
        const existingCheck = await connection.promise().query(
            `SELECT im.itemCode
             FROM itemmaster im
             JOIN bomdetails bd ON im.itemId = bd.itemId
             WHERE bd.projectNumber = ? AND bd.stageId = ?
             AND im.itemCode IN (?)`,
            [projectNumber, parsedStageId, itemCodes]
        );

        if (existingCheck[0].length > 0) {
            const duplicateItems = existingCheck[0].map((r) => r.itemCode).join(', ');
            return res.status(400).json(
                new ApiError(400, `Items already exist in this stage: ${duplicateItems}`)
            );
        }

        // Start transaction and import items
        await connection.promise().beginTransaction();

        try {
            for (const item of validatedItems) {
                // Insert into itemmaster
                const [itemResult] = await connection.promise().query(
                    'INSERT INTO itemmaster (itemCode, itemName, specification) VALUES (?, ?, ?)',
                    [item.itemCode, item.itemName, item.specification || null]
                );

                const itemId = itemResult.insertId;

                // Insert into bomdetails
                await connection.promise().query(
                    `INSERT INTO bomdetails
                     (itemId, ELength, EWidth, EHeight, EQuantity, ALength, AWidth, AHeight, AQuantity, projectNumber, stageId)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        itemId,
                        item.ALength || null,
                        item.AWidth || null,
                        item.AHeight || null,
                        item.AQuantity || null,
                        item.ALength || null,
                        item.AWidth || null,
                        item.AHeight || null,
                        item.AQuantity || null,
                        projectNumber,
                        parsedStageId
                    ]
                );
            }

            await connection.promise().commit();
            res.status(200).json(
                new ApiResponse(200, { imported: validatedItems.length }, `Successfully imported ${validatedItems.length} items`)
            );
        } catch (error) {
            await connection.promise().rollback();
            throw error;
        }
    } catch (error) {
        console.error('Import error:', error);
        return res.status(500).json(
            new ApiError(500, error.message || 'Error importing BOM items from Excel')
        );
    }
});

// Download BOM template
const downloadBomTemplate = asyncHandler(async (req, res) => {
    try {
        const templateData = [
            {
                itemCode: 'ITEM-001',
                itemName: 'Sample Item',
                specification: 'Sample specification',
                material: 'Steel',
                grade: 'Grade A',
                ALength: 100,
                AWidth: 50,
                AHeight: 25,
                AQuantity: 10,
                unit: 'pcs',
                weight: 2.5,
                rate: 500,
                remark: 'Sample remark'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM Template');

        // Generate buffer and send
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=BOM_Template.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Template download error:', error);
        return res.status(500).json(new ApiError(500, 'Error generating template'));
    }
});

export {
    addBomDesign,
    fetchBomDetailsByProjectNumber,
    fetchBomDetailsByItemId,
    updateBomDesign,
    deleteBomDesign,
    importBomFromProject,
    importBomFromExcel,
    downloadBomTemplate
};
