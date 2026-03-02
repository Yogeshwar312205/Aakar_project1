import { connection } from "../db/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createActivity = asyncHandler((req, res) => {
    const { activity_name } = req.body;
    if (!activity_name) {
        res.status(400);
        throw new Error('Activity name is required.');
    }

    connection.query('INSERT INTO activity (activity_name) VALUES (?)', [activity_name], (err, result) => {
        if (err) {
            res.status(500);
            throw new Error("Error creating activity: " + err.message);
        }
        res.status(201).json({ activity_id: result.insertId, activity_name });
    });
});

export const getAllActivities = asyncHandler((req, res) => {
    const query = 'SELECT * FROM activity';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500);
            throw new Error("Error fetching activities: " + err.message);
        }
        // The results are already an array of activities, so we can send them directly.
        res.status(200).json(results);
    });
});

export const getActivityById = asyncHandler((req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM activity WHERE activityid = ?', [id], (err, rows) => {
        if (err) {
            res.status(500);
            throw new Error("Error fetching activity: " + err.message);
        }
        if (rows.length === 0) {
            res.status(404);
            throw new Error('Activity not found.');
        }
        res.status(200).json(rows[0]);
    });
});

export const updateActivity = asyncHandler((req, res) => {
    console.log("In updateActivity controller")
    const { id } = req.params;
    const { activity_name } = req.body;
    console.log("Activity ID:", id, "Activity Name:", activity_name)
    if (!activity_name) {
        res.status(400);
        throw new Error('Activity name is required.');
    }

    connection.query('UPDATE activity SET activity_name = ? WHERE activityid = ?', [activity_name, id], (err, result) => {
        if (err) {
            console.log("err updating: ", err)
            res.status(500);
            throw new Error("Error updating activity: " + err.message);
        }
        if (result.affectedRows === 0) {
            res.status(404);
            throw new Error('Activity not found.');
        }
        res.status(200).json({ message: 'Activity updated successfully.' });
    });
});

export const deleteActivity = asyncHandler((req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM activity WHERE activityid = ?', [id], (err, result) => {
        if (err) {
            res.status(500);
            throw new Error("Error deleting activity: " + err.message);
        }
        if (result.affectedRows === 0) {
            res.status(404);
            throw new Error('Activity not found.');
        }
        res.status(200).json({ message: 'Activity deleted successfully.' });
    });
});