import { addBomDesign, fetchBomDetailsByProjectNumber, fetchBomDetailsByItemId, updateBomDesign, deleteBomDesign, importBomFromProject, importBomFromExcel, downloadBomTemplate } from "../controllers/bom.controller.js";
import { Router } from "express";
import { upload, uploadMemory } from "../utils/multer.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { rbacMiddleware } from "../middleware/rbacMiddleware.js";

const router = Router();

// Apply authentication middleware to all BOM routes
router.use(authMiddleware);

// BOM edit endpoints - require RBAC authorization checks
router.route("/addBomDesign").post(rbacMiddleware, addBomDesign);
router.route("/updateBomDesign/:bomId").put(rbacMiddleware, updateBomDesign);
router.route("/deleteBomDesign/:itemId").delete(rbacMiddleware, deleteBomDesign);
router.route("/importBom").post(rbacMiddleware, importBomFromProject);
router.route("/importBomExcel").post(rbacMiddleware, uploadMemory.single("file"), importBomFromExcel);

// BOM read endpoints - require RBAC filtering
router.route("/fetchBomDetails/:projectNumber").get(rbacMiddleware, fetchBomDetailsByProjectNumber);
router.route("/fetchBomDetailsByItemId/:itemId").get(fetchBomDetailsByItemId);

// Template download - no RBAC needed
router.route("/downloadTemplate").get(downloadBomTemplate);

export default router;
