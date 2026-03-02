import express from "express";

import {
    getAllDepartments,
    getAllWorkingDepartments,
    getClosedDepartments,
    addDepartment, deleteDepartment, updateDepartment, moveEmployee
} from "../controllers/department.controller.js";

const router = express.Router()

router.route('/').get((req, res) => {
    res.json('department')
})

router.get('/getAllDepartments', getAllDepartments);
router.get('/getAllWorkingDepartments', getAllWorkingDepartments);
router.get('/getClosedDepartments', getClosedDepartments);
router.post('/addDepartment', addDepartment);
router.post('/deleteDepartment', deleteDepartment);
router.put('/updateDepartment', updateDepartment);

export default router