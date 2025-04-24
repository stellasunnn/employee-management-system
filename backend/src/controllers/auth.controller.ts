import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";
import { RegistrationToken } from "../models/RegistrationToken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const register = async (req: Request, res: Response) => {
  const { token, username, email, password } = req.body;

  try {
    // Find the registration token
    const registrationToken = await RegistrationToken.findOne({ token });

    if (!registrationToken) {
      return res.status(401).json({ message: "Invalid registration token" });
    }

    // Check if token has expired
    if (registrationToken.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ message: "Registration token has expired" });
    }

    // Check if token has already been used
    if (registrationToken.status === "registered") {
      return res.status(401).json({ message: "Token has already been used" });
    }

    // Check if email matches the token's email
    if (registrationToken.email !== email) {
      return res
        .status(401)
        .json({ message: "Email does not match the token's email" });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({ username, email, password });
    await user.save();

    // Update token status to registered
    registrationToken.status = "registered";
    await registrationToken.save();

    // Generate JWT
    const payload = { id: user._id };
    const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token: authToken });
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
