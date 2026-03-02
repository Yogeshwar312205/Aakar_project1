// backend/routes/auth.routes.js
import express from "express";
import {refreshToken, validate} from "../controllers/auth.controller.js";

const router = express.Router();

// Refresh token route
router.post("/refresh-token", refreshToken);
router.post("/validate", validate);

export default router;
