import express from "express";
import { auth } from "../middleware/auth.middleware";
import {
  getPersonalInfo,
  updatePersonalInfo,
//   updateProfilePicture,
} from "../controllers/personal.controller";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Personal information routes
router.get("/", getPersonalInfo);
router.put("/", updatePersonalInfo);
// router.put("/profile-picture", updateProfilePicture);

export default router;