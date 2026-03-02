import express from "express";
import {addDesignation, getAllDesignations, updateDesignation} from "../controllers/designation.controller.js";

const router = express.Router()

router.post('/addDesignation', addDesignation);
router.put('/:id/edit', updateDesignation);
router.get('/getAllDesignations', getAllDesignations);

export default router;