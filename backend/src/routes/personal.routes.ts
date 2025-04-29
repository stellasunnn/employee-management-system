import express from "express";
import { auth } from "../middleware/auth.middleware";
import {
  getPersonalInfo,
  updatePersonalInfo,
  updateProfilePicture,
//   getDocument,
//   downloadDocument
} from "../controllers/personal.controller";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Personal information routes
router.get("/", getPersonalInfo);
router.put("/", updatePersonalInfo);
router.put("/profile-picture", updateProfilePicture);
// router.get("/document/:type", getDocument);
// router.get("/document/:type/download", downloadDocument);

export default router;