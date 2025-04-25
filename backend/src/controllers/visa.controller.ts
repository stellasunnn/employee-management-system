import { Request, Response } from "express";
import Visa, { DocumentType, DocumentStatus } from "../models/visa.model";
import { uploadToS3 } from "../utils/s3";
import { AuthRequest } from "../middleware/auth.middleware";

// Get current user's visa status
export const getVisaStatus = async (req: AuthRequest, res: Response) => {
  try {
    const visa = await Visa.findOne({ user: req.user?._id });

    if (!visa) {
      return res.status(404).json({ message: "No visa application found" });
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
    // try {
    //   fileUrl = await uploadToS3(req.file);
    //   console.log("fileUrl", fileUrl);
    // } catch (error) {
    //   console.error("Error uploading file to S3:", error);
    //   return res.status(500).json({ message: "Failed to upload document" });
    // }
    // Use static S3 URL instead of uploading
    fileUrl =
      "https://onboarding-synnie.s3.us-west-1.amazonaws.com/download.jpeg";

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
      // 1. 先筛出有用户的申请
      {
        $match: {
          user: { $exists: true },
        },
      },
      // 2. 找到最后一个 document（按上传时间）
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
      // 3. 应用 in-progress 逻辑
      {
        $match: {
          $or: [
            { currentStep: { $ne: "I_20" } }, // 流程还没走完
            { documents: { $size: 0 } }, // 还没提交任何材料
            { "lastDocument.type": { $ne: "I_20" } }, // 最后一个不是 I_20
            { "lastI20Doc.status": { $ne: "APPROVED" } }, // I_20 还没通过
          ],
        },
      },
      // 4. 如果你想带出 user 的 name/email，需要再 $lookup 或用 .populate in Mongoose
    ]);

    res.json(visas);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all visa applications for HR
export const getAllVisaApplications = async (req: Request, res: Response) => {
  try {
    const visas = await Visa.find().populate("user", "name email");
    res.json(visas);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
      return "Please upload a copy of the signed I-983";
    case DocumentType.I_20:
      return "Please upload a copy of your I-20";
    default:
      return "";
  }
}
