import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { IRegistrationToken } from "../types/registration-token.types";
import { sendEmail } from "../utils/email";
import { RegistrationToken } from "../models/RegistrationToken";
import { OnboardingApplication } from "../models/OnboardingApplication";
import Visa, { DocumentType, DocumentStatus } from "../models/visa.model";

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

export const getApplications = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query = { status };
    }

    const applications = await OnboardingApplication.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

// Approve an application
export const approveApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find the application
    const application = await OnboardingApplication.findById(id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application?.citizenshipStatus?.workAuthorizationType === "F1") {

    // Find the latest OPT receipt document
    const optReceiptDocs = application.documents
      .filter((doc) => doc.type === "opt_receipt")
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());

    if (optReceiptDocs.length === 0) {
      return res
        .status(400)
        .json({ error: "No OPT receipt document found in the application" });
    }

    const latestOptReceiptDoc = optReceiptDocs[0];

    // Find or create visa application for the user
    let visa = await Visa.findOne({ user: application.userId });
    if (!visa) {
      visa = new Visa({
        user: application.userId,
        currentStep: DocumentType.OPT_RECEIPT,
        documents: [],
      });
    }

    // Add the OPT receipt document to the visa application
    visa.documents.push({
      type: DocumentType.OPT_RECEIPT,
      fileUrl: latestOptReceiptDoc.fileUrl,
      status: DocumentStatus.PENDING,
      feedback: "",
      uploadedAt: new Date(),
    });

    await visa.save();
  }

    // Update the application status
    const updatedApplication = await OnboardingApplication.findByIdAndUpdate(
      id,
      { status: "approved" }
      // { new: true }
    );

    res.status(200).json({
      message: "Application approved successfully and visa document uploaded",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ error: "Failed to approve application" });
  }
};

// Reject an application with feedback
export const rejectApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback || feedback.trim() === "") {
      return res
        .status(400)
        .json({ error: "Feedback is required for rejection" });
    }

    const application = await OnboardingApplication.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectionFeedback: feedback,
      }
      // { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json({
      message: "Application rejected successfully",
      application,
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ error: "Failed to reject application" });
  }
};
