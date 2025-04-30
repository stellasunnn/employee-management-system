import express from "express";
import { auth } from "../middleware/auth.middleware";
import {
  getOnboardingApplication,
  createOnboardingApplication,
  updateApplicationStatus,
  getOnboardingApplicationStatus
} from "../controllers/onboarding.controller";
import { isAdmin } from "../middleware/admin.middleware";

const router = express.Router();

// User routes
router.get("/application", auth, getOnboardingApplication);
router.get("/application/status", auth, getOnboardingApplicationStatus);
router.post("/application", auth, createOnboardingApplication);

// Admin routes
router.put("/application/:applicationId/status", auth, isAdmin, updateApplicationStatus);

export default router;