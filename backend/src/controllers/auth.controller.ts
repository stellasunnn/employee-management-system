import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const REGISTRATION_TOKEN = "abc123"; // Hardcoded for MVP

export const register = async (req: Request, res: Response) => {
  const { token, username, email, password } = req.body;

  if (token !== REGISTRATION_TOKEN) {
    console.log("token", token, username, email, password);
    return res.status(401).json({ message: "Invalid registration token" });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({ username, email, password });
    await user.save();

    // Generate JWT
    const payload = { id: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const payload = { id: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
