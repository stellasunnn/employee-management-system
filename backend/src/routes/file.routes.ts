import express from "express";
import { auth } from "../middleware/auth.middleware";
import { uploadFile, downloadFile, upload } from "../controllers/file.controller";

const router = express.Router();

// File upload and download routes
router.post("/upload", auth, upload.single('file'), uploadFile);
router.get("/download/:filename", auth, downloadFile);

export default router; 