import { Request, Response } from "express";
import Visa, { DocumentType, DocumentStatus } from "../models/visa.model";
import { uploadToS3 } from "../utils/s3";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendEmail } from "../utils/email";
import { IUser } from "../types/user.types";

// Get current user's visa status
export const getVisaStatus = async (req: AuthRequest, res: Response) => {
  try {
    const visa = await Visa.findOne({ user: req.user?._id });

    if (!visa) {
      //   return res.status(404).json({ message: "No visa application found" });
      return res.json({
        currentStep: "OPT_RECEIPT",
        message: "No visa application found",
      });
    }

    const currentDocument = visa.documents[visa.documents.length - 1];
    let message = "";

    if (!currentDocument) {
      message = getNextStepMessage(visa.currentStep);
    } else {
      switch (currentDocument.status) {
        case DocumentStatus.PENDING:
          message = getPendingMessage(visa.currentStep);
          break;
        case DocumentStatus.APPROVED:
          if (currentDocument.type === DocumentType.I_20) {
            message = "All documents have been approved.";
          } else {
            message = getNextStepMessage(visa.currentStep);
          }
          break;
        case DocumentStatus.REJECTED:
          message = currentDocument.feedback;
          break;
      }
    }

    res.json({
      currentStep: visa.currentStep,
      documents: visa.documents,
      message,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Upload visa document
export const uploadVisaDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    let visa = await Visa.findOne({ user: req.user._id });

    // If no visa application exists, create a new one starting with OPT Receipt
    if (!visa) {
      try {
        visa = new Visa({
          user: req.user._id,
          currentStep: DocumentType.OPT_RECEIPT,
          documents: [],
        });
        await visa.save();
      } catch (error) {
        console.error("Error creating new visa application:", error);
        return res
          .status(500)
          .json({ message: "Failed to create visa application" });
      }
    }

    // Check if there's a pending document for the current step
    const pendingDocument = visa.documents.find(
      (doc) =>
        doc.type === visa.currentStep && doc.status === DocumentStatus.PENDING
    );

    if (pendingDocument) {
      return res
        .status(400)
        .json({ message: "Previous document is still pending approval" });
    }

    let fileUrl;

    try {
      fileUrl = await uploadToS3(req.file!);
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return res.status(500).json({ message: "Failed to upload document" });
    }
    // Use static S3 URL instead of uploading
    // fileUrl =
    //   "https://onboarding-synnie.s3.us-west-1.amazonaws.com/download.jpeg";

    try {
      visa.documents.push({
        type: visa.currentStep,
        fileUrl,
        status: DocumentStatus.PENDING,
        feedback: "",
        uploadedAt: new Date(),
      });

      await visa.save();
      res.json({ message: "Document uploaded successfully" });
    } catch (error) {
      console.error("Error saving visa document:", error);
      return res.status(500).json({ message: "Failed to save document" });
    }
  } catch (error) {
    console.error("Unexpected error in uploadVisaDocument:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// HR approve document
export const approveVisaDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visa = await Visa.findById(id);

    if (!visa) {
      return res.status(404).json({ message: "Visa application not found" });
    }
    const currentDocument = visa.documents[visa.documents.length - 1];
    if (!currentDocument) {
      return res.status(400).json({ message: "No document to approve" });
    }

    if (currentDocument.status !== DocumentStatus.PENDING) {
      return res
        .status(400)
        .json({ message: "Can only approve documents with pending status" });
    }

    currentDocument.status = DocumentStatus.APPROVED;
    currentDocument.reviewedAt = new Date();

    // Move to next step
    const nextStep = getNextDocumentType(visa.currentStep);
    if (nextStep) {
      visa.currentStep = nextStep;
    }

    await visa.save();
    res.json({ message: "Document approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// HR reject document
export const rejectVisaDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const visa = await Visa.findById(id);
    if (!visa) {
      return res.status(404).json({ message: "Visa application not found" });
    }
    const currentDocument = visa.documents[visa.documents.length - 1];
    if (!currentDocument) {
      return res.status(400).json({ message: "No document to reject" });
    }
    if (currentDocument.status !== DocumentStatus.PENDING) {
      return res
        .status(400)
        .json({ message: "Can only reject documents with pending status" });
    }

    currentDocument.status = DocumentStatus.REJECTED;
    currentDocument.feedback = feedback;
    currentDocument.reviewedAt = new Date();

    await visa.save();
    res.json({ message: "Document rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get in-progress visa applications for HR
export const getInProgressVisaApplications = async (
  req: Request,
  res: Response
) => {
  try {
    const visas = await Visa.aggregate([
      // 1. Match visas with users
      {
        $match: {
          user: { $exists: true },
        },
      },
      // 2. Find last document and I-20 document
      {
        $addFields: {
          lastDocument: { $arrayElemAt: ["$documents", -1] },
          lastI20Doc: {
            $last: {
              $filter: {
                input: "$documents",
                as: "doc",
                cond: { $eq: ["$$doc.type", "I_20"] },
              },
            },
          },
        },
      },
      // 3. Apply in-progress logic
      {
        $match: {
          $or: [
            { currentStep: { $ne: "I_20" } },
            { documents: { $size: 0 } },
            { "lastDocument.type": { $ne: "I_20" } },
            { "lastI20Doc.status": { $ne: "APPROVED" } },
          ],
        },
      },
      // 4. Join with users collection
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      // 5. Unwind user array
      {
        $unwind: "$user",
      },
      // 6. Join with onboardingapplications collection
      {
        $lookup: {
          from: "onboardingapplications",
          let: { userId: "$user._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$userId"],
                },
              },
            },
          ],
          as: "onboarding",
        },
      },
      // 7. Add a field to check if onboarding exists
      {
        $addFields: {
          hasOnboarding: { $gt: [{ $size: "$onboarding" }, 0] },
        },
      },
      // 8. Unwind onboarding array with preserveNullAndEmptyArrays
      {
        $unwind: {
          path: "$onboarding",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 9. Add calculated fields
      {
        $addFields: {
          "user.username": {
            $cond: {
              if: "$hasOnboarding",
              then: {
                $concat: ["$onboarding.firstName", " ", "$onboarding.lastName"],
              },
              else: "$user.username",
            },
          },
          workAuthorization: {
            $cond: {
              if: "$hasOnboarding",
              then: {
                title: "$onboarding.citizenshipStatus.workAuthorizationType",
                startDate: "$onboarding.citizenshipStatus.startDate",
                endDate: "$onboarding.citizenshipStatus.expirationDate",
                daysRemaining: {
                  $floor: {
                    $divide: [
                      {
                        $subtract: [
                          "$onboarding.citizenshipStatus.expirationDate",
                          new Date(),
                        ],
                      },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      // 10. Project only needed fields
      {
        $project: {
          _id: 1,
          currentStep: 1,
          documents: 1,
          lastDocument: 1,
          workAuthorization: 1,
          user: {
            _id: "$user._id",
            username: "$user.username",
            email: "$user.email",
          },
        },
      },
    ]);

    res.json(visas);
  } catch (error) {
    console.error("Error in getInProgressVisaApplications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all visa applications for HR
export const getAllVisaApplications = async (req: Request, res: Response) => {
  try {
    const visas = await Visa.aggregate([
      // 1. Match visas with users
      {
        $match: {
          user: { $exists: true },
        },
      },
      // 2. Find last document and I-20 document
      {
        $addFields: {
          lastDocument: { $arrayElemAt: ["$documents", -1] },
          lastI20Doc: {
            $last: {
              $filter: {
                input: "$documents",
                as: "doc",
                cond: { $eq: ["$$doc.type", "I_20"] },
              },
            },
          },
        },
      },
      // 3. Join with users collection
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      // 4. Unwind user array
      {
        $unwind: "$user",
      },
      // 5. Join with onboardingapplications collection
      {
        $lookup: {
          from: "onboardingapplications",
          let: { userId: "$user._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$userId"],
                },
              },
            },
          ],
          as: "onboarding",
        },
      },
      // 6. Add a field to check if onboarding exists
      {
        $addFields: {
          hasOnboarding: { $gt: [{ $size: "$onboarding" }, 0] },
        },
      },
      // 7. Unwind onboarding array with preserveNullAndEmptyArrays
      {
        $unwind: {
          path: "$onboarding",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 8. Add calculated fields
      {
        $addFields: {
          "user.username": {
            $cond: {
              if: "$hasOnboarding",
              then: {
                $concat: ["$onboarding.firstName", " ", "$onboarding.lastName"],
              },
              else: "$user.username",
            },
          },
          workAuthorization: {
            $cond: {
              if: "$hasOnboarding",
              then: {
                title: "$onboarding.citizenshipStatus.workAuthorizationType",
                startDate: "$onboarding.citizenshipStatus.startDate",
                endDate: "$onboarding.citizenshipStatus.expirationDate",
                daysRemaining: {
                  $floor: {
                    $divide: [
                      {
                        $subtract: [
                          "$onboarding.citizenshipStatus.expirationDate",
                          new Date(),
                        ],
                      },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      // 9. Project only needed fields
      {
        $project: {
          _id: 1,
          currentStep: 1,
          documents: 1,
          lastDocument: 1,
          workAuthorization: 1,
          user: {
            _id: "$user._id",
            username: "$user.username",
            email: "$user.email",
          },
        },
      },
    ]);

    res.json(visas);
  } catch (error) {
    console.error("Error in getAllVisaApplications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send reminder email to employee about next visa steps
export const sendVisaReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visa = await Visa.findById(id).populate<{ user: IUser }>(
      "user",
      "email username"
    );

    if (!visa) {
      return res.status(404).json({ message: "Visa application not found" });
    }

    if (!visa.user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentDocument = visa.documents[visa.documents.length - 1];
    let nextStepMessage = "";

    if (!currentDocument) {
      nextStepMessage = getNextStepMessage(visa.currentStep);
    } else {
      switch (currentDocument.status) {
        case DocumentStatus.PENDING:
          nextStepMessage = getPendingMessage(visa.currentStep);
          break;
        case DocumentStatus.APPROVED:
          if (currentDocument.type === DocumentType.I_20) {
            nextStepMessage = "All documents have been approved.";
          } else {
            nextStepMessage = getNextStepMessage(visa.currentStep);
          }
          break;
        case DocumentStatus.REJECTED:
          nextStepMessage = currentDocument.feedback;
          break;
      }
    }
    console.log("nextStepMessage", nextStepMessage);

    // Send email to employee
    await sendEmail({
      to: visa.user.email,
      subject: "Visa Document Reminder",
      html: `
        <h1>Visa Document Reminder</h1>
        <p>Hello ${visa.user.username},</p>
        <p>This is a reminder about your visa document status:</p>
        <p>${nextStepMessage}</p>
        <p>Please log in to your account to check your visa status and take the necessary actions.</p>
        <p>Best regards,<br>HR Team</p>
      `,
    });

    res.json({ message: "Reminder email sent successfully" });
  } catch (error) {
    console.error("Error sending reminder email:", error);
    res.status(500).json({ message: "Failed to send reminder email" });
  }
};

// Helper functions
function getNextDocumentType(currentStep: DocumentType): DocumentType | null {
  switch (currentStep) {
    case DocumentType.OPT_RECEIPT:
      return DocumentType.OPT_EAD;
    case DocumentType.OPT_EAD:
      return DocumentType.I_983;
    case DocumentType.I_983:
      return DocumentType.I_20;
    case DocumentType.I_20:
      return null;
    default:
      return null;
  }
}

function getPendingMessage(type: DocumentType): string {
  switch (type) {
    case DocumentType.OPT_RECEIPT:
      return "Waiting for HR to approve your OPT Receipt";
    case DocumentType.OPT_EAD:
      return "Waiting for HR to approve your OPT EAD";
    case DocumentType.I_983:
      return "Waiting for HR to approve and sign your I-983";
    case DocumentType.I_20:
      return "Waiting for HR to approve your I-20";
    default:
      return "";
  }
}

function getNextStepMessage(type: DocumentType): string {
  switch (type) {
    case DocumentType.OPT_RECEIPT:
      return "Please upload a copy of your OPT RECEIPT";
    case DocumentType.OPT_EAD:
      return "Please upload a copy of your OPT EAD";
    case DocumentType.I_983:
      return "“Please download and fill out the I-983 form";
    case DocumentType.I_20:
      return "Please upload a copy of your I-20";
    default:
      return "";
  }
}
