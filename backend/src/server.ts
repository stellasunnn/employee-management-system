import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import hrRoutes from "./routes/hr.routes";
import visaRoutes from "./routes/visa.routes";

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/visa", visaRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
