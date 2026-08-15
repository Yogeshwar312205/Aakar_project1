import express from "express";
import {addDesignation, getAllDesignations, updateDesignation} from "../controllers/designation.controller.js";

const router = express.Router()

// Add logging middleware to debug
router.use((req, res, next) => {
    console.log(`📍 Designation Route: ${req.method} ${req.originalUrl}`);
    console.log('Body:', req.body);
    next();
});

router.post('/addDesignation', addDesignation);
router.put('/:id/edit', updateDesignation);
router.get('/getAllDesignations', getAllDesignations);

export default router;