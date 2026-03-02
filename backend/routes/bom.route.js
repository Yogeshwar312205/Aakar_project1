import { addBomDesign, fetchBomDetailsByProjectNumber, fetchBomDetailsByItemId, updateBomDesign, deleteBomDesign } from "../controllers/bom.controller.js";
import { Router } from "express";

const router = Router();

router.route("/addBomDesign").post(addBomDesign); 
router.route("/fetchBomDetails/:projectNumber").get(fetchBomDetailsByProjectNumber); 
router.route("/fetchBomDetailsByItemId/:itemId").get(fetchBomDetailsByItemId); 
router.route("/updateBomDesign/:bomId").put(updateBomDesign); 
router.route("/deleteBomDesign/:itemId").delete(deleteBomDesign); 

export default router;
