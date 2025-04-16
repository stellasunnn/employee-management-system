import express from "express";
import { auth, AuthRequest } from "../middleware/auth.middleware";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/auth.controller";

const router = express.Router();

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get current user
router.get("/me", auth, getCurrentUser);

export default router;
