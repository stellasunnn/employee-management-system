import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { IRegistrationToken } from "../types/registration-token.types";
import { sendEmail } from "../utils/email";
import { RegistrationToken } from "../models/RegistrationToken";

export const generateToken = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3); // Token expires in 3 hours

    const registrationToken: IRegistrationToken = {
      token,
      email,
      name,
      expiresAt,
      status: "pending",
      createdAt: new Date(),
    };

    await RegistrationToken.create(registrationToken);

    // Send email with registration link
    const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Welcome to Our Company - Complete Your Registration",
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Please click the link below to complete your registration:</p>
        <a href="${registrationLink}">Complete Registration</a>
        <p>This link will expire in 3 hours.</p>
      `,
    });

    res.status(201).json({
      message: "Registration token generated and email sent successfully",
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate registration token" });
  }
};

export const getTokenHistory = async (req: Request, res: Response) => {
  try {
    const tokens = await RegistrationToken.find()
      .sort({ createdAt: -1 })
      .select("email name token status createdAt expiresAt");

    res.status(200).json(tokens);
  } catch (error) {
    console.error("Error fetching token history:", error);
    res.status(500).json({ error: "Failed to fetch token history" });
  }
};
