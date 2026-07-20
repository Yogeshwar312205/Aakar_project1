import { Router } from 'express'
import { upload } from "../utils/multer.js"

import {
    addEmployee,
    deleteEmployee,
    getAllEmployees,
    getCurrentEmployeeAccess,
    changePassword,
    loginEmployee,
    logoutEmployee,
    editEmployeeWithRelations, importEmployees,
} from '../controllers/employee.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import {deleteMultipleEmployees, moveEmployee} from "../controllers/department.controller.js";

const router = Router()

router.post('/addEmployee', addEmployee)
router.post('/loginEmployee', loginEmployee)
router.post('/logoutEmployee', authMiddleware, logoutEmployee)
router.post('/deleteEmployee', deleteEmployee)
// router.post('/updateEmployee', updateEmployee)
router.get('/getAllEmployees', getAllEmployees)
router.get('/:employeeId/access', authMiddleware, getCurrentEmployeeAccess)
router.put('/:employeeId/change-password', authMiddleware, changePassword)
router.post('/moveEmployee', moveEmployee)
router.post('/deleteMultipleEmployees', deleteMultipleEmployees)
router.put('/:id/with-relations', editEmployeeWithRelations);
router.post('/importEmployees', upload.single("employeeExcel") ,importEmployees)


export default router
