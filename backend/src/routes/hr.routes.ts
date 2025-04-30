import express from "express";

import { generateToken, getTokenHistory, getApplications, approveApplication, rejectApplication } from "../controllers/hr.controller";
import { auth, authenticateHR } from "../middleware/auth.middleware";

const router = express.Router();


// Protect all HR routes with authentication middleware
router.use(auth);
router.use(authenticateHR);

// Generate a new registration token
router.post("/generate-token", generateToken);

// Get token history
router.get("/token-history", getTokenHistory);

// Get all applications (optionally filtered by status)
router.get('/', getApplications);

// Approve an application
router.post('/:id/approve', approveApplication);

// Reject an application with feedback
router.post('/:id/reject', rejectApplication);

export default router;
