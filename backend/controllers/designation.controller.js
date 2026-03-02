import asyncHandler from "../utils/asyncHandler.js";
import {connection} from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addDesignation = asyncHandler(async (req, res) => {
    const {designationName} = req.body;

    console.log(designationName);

    const insertQuery = "INSERT INTO designation (designationName) VALUES (?);";

    connection.query(insertQuery, [designationName], (err, result, fields) => {
        if (err) {
            res.status(400).json(new ApiError(400, "Error while adding designation", ['Error while adding designation']));
            return;
        }

        res.status(201).json(new ApiResponse(201, {designationId: result.insertId, ...req.body}, "Designation Added."));
    });
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
