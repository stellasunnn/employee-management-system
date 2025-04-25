import mongoose from "mongoose";

export enum DocumentType {
  OPT_RECEIPT = "OPT_RECEIPT",
  OPT_EAD = "OPT_EAD",
  I_983 = "I_983",
  I_20 = "I_20",
}

export enum DocumentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

const visaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documents: [
      {
        type: {
          type: String,
          enum: Object.values(DocumentType),
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: Object.values(DocumentStatus),
          default: DocumentStatus.PENDING,
        },
        feedback: {
          type: String,
          default: "",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        reviewedAt: {
          type: Date,
        },
      },
    ],
    currentStep: {
      type: String,
      enum: Object.values(DocumentType),
      default: DocumentType.OPT_RECEIPT,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Visa", visaSchema);
