import asyncHandler from "../utils/asyncHandler.js";
import { connection } from "../db/index.js";
import { generateAccessToken } from "../utils/tokens.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Check Access Token Validity
export const checkToken = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).json(new ApiError(401, 'Token is missing'));
    }

    try {
        jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        return res.status(200).json(new ApiResponse(200, true, "Token is valid"));
    } catch (error) {
        return res.status(401).json(new ApiError(401, 'Invalid or expired token'));
    }
});

// Refresh Token Endpoint
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json(new ApiError(400, 'Refresh token is required'));
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const employeeId = decoded.employeeId;

        const [employee] = await connection.promise().query(
            'SELECT * FROM employee WHERE customEmployeeId = ?', [employeeId]
        );

        if (employee.length === 0 || employee[0].employeeRefreshToken !== refreshToken) {
            return res.status(401).json(new ApiError(401, 'Invalid refresh token'));
        }

        const newAccessToken = generateAccessToken({ employeeId, employeeEmail: employee[0].employeeEmail });
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(401).json(new ApiError(401, 'Invalid or expired refresh token'));
    }
});

// Validate User and Return Tokens
export const validate = asyncHandler(async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json(new ApiError(401, 'Token is missing'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const employeeId = decoded.employeeId;

        const [result] = await connection.promise().query(
            'SELECT employeeAccess, employeeRefreshToken FROM employee WHERE employeeId = ?', [employeeId]
        );

        if (!result.length) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        res.status(200).json(new ApiResponse(200, {
            accessToken: token,
            refreshToken: result[0].employeeRefreshToken,
            employeeAccess: result[0].employeeAccess,
        }, "Validation completed"));
    } catch (error) {
        return res.status(401).json(new ApiError(401, 'Invalid or expired token'));
    }
});
