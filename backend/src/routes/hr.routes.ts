import express from "express";
import { generateToken, getTokenHistory } from "../controllers/hr.controller";
import { auth, authenticateHR } from "../middleware/auth.middleware";

const router = express.Router();

// Protect all HR routes with authentication middleware
router.use(auth);
router.use(authenticateHR);

// Generate a new registration token
router.post("/generate-token", generateToken);

// Get token history
router.get("/token-history", getTokenHistory);

export default router;
