import express from "express";
import { auth } from "../middleware/auth.middleware";
import {
  getOnboardingApplication,
  createOnboardingApplication,
  //uploadDocument,
//   getDocument,
  updateApplicationStatus
} from "../controllers/onboarding.controller";
import { isAdmin } from "../middleware/admin.middleware";

const router = express.Router();

// User routes
router.get("/application", auth, getOnboardingApplication);
router.post("/application", auth, createOnboardingApplication);
//router.post("/document", auth, uploadDocument);

// Admin routes
router.patch("/application/:applicationId/status", [auth, isAdmin], updateApplicationStatus);

export default router;