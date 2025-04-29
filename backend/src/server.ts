import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

// Import routes
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import hrRoutes from "./routes/hr.routes";
import visaRoutes from "./routes/visa.routes";
import personalRoutes from "./routes/personal.routes";
import fileRoutes from './routes/file.routes';

import { notFound, errorHandler } from "./middleware/error.middleware";
import connectDB from "./config/db";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/visa", visaRoutes);
app.use("/api/personal", personalRoutes);
app.use('/api/files', fileRoutes); 

// Error handling middleware
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
