import { addBomDesign, fetchBomDetailsByProjectNumber, fetchBomDetailsByItemId, updateBomDesign, deleteBomDesign, importBomFromProject, importBomFromExcel, downloadBomTemplate } from "../controllers/bom.controller.js";
import { Router } from "express";
import { upload, uploadMemory } from "../utils/multer.js";

const router = Router();

router.route("/addBomDesign").post(addBomDesign);
router.route("/fetchBomDetails/:projectNumber").get(fetchBomDetailsByProjectNumber);
router.route("/fetchBomDetailsByItemId/:itemId").get(fetchBomDetailsByItemId);
router.route("/updateBomDesign/:bomId").put(updateBomDesign);
router.route("/deleteBomDesign/:itemId").delete(deleteBomDesign);
router.route("/importBom").post(importBomFromProject);
router.route("/importBomExcel").post(uploadMemory.single("file"), importBomFromExcel);
router.route("/downloadTemplate").get(downloadBomTemplate);

export default router;
