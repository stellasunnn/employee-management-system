import express from "express";
import { auth, authenticateHR } from "../middleware/auth.middleware";
import {
  getVisaStatus,
  uploadVisaDocument,
  approveVisaDocument,
  rejectVisaDocument,
  getInProgressVisaApplications,
  getAllVisaApplications,
} from "../controllers/visa.controller";
import upload from "../config/multer.config";

const router = express.Router();

// User routes
router.get("/", auth, getVisaStatus);
router.post("/upload", auth, upload.single("file"), uploadVisaDocument);

// HR routes
router.post("/hr/:id/approve", auth, authenticateHR, approveVisaDocument);
router.post("/hr/:id/reject", auth, authenticateHR, rejectVisaDocument);
router.get(
  "/hr/in-progress",
  auth,
  authenticateHR,
  getInProgressVisaApplications
);
router.get("/hr/all", auth, authenticateHR, getAllVisaApplications);

export default router;
