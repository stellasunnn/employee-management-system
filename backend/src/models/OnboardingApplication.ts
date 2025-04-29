import mongoose, { Schema } from "mongoose";
import { IOnboardingApplication } from "../types/onboardingApplication.types";

interface IOnboardingApplicationModel
  extends mongoose.Model<IOnboardingApplication> {
  // Add any static methods here if needed
}

const OnboardingApplicationSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionFeedback: String,
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  preferredName: String,
  profilePicture: String,
  address: {
    addressOne: { type: String, required: true },
    addressTwo: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  cellPhone: { type: String, required: true },
  workPhone: String,
  email: { type: String, required: true },
  ssn: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: {
    type: String,
    enum: ["male", "female", "prefer_not_to_say"],
    required: true,
  },
  citizenshipStatus: {
    isPermanentResident: { type: Boolean, required: true },
    type: {
      type: String,
      enum: ["green_card", "citizen", "work_authorization"],
      required: true,
    },
    workAuthorizationType: {
      type: String,
      enum: ["H1-B", "L2", "F1", "H4", "other"],
    },
    workAuthorizationOther: String,
    startDate: Date,
    expirationDate: Date,
  },
  reference: {
    type: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      middleName: String,
      phone: { type: String, required: true },
      email: { type: String, required: true },
      relationship: { type: String, required: true },
    },
    required: false,
  },

  emergencyContacts: {
    type: [
      {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        middleName: String,
        phone: { type: String, required: true },
        email: { type: String, required: true },
        relationship: { type: String, required: true },
      },
    ],
    required: false,
  },
  documents: [
    {
      type: {
        type: String,
        enum: ["driver_license", "work_authorization", "opt_receipt", "other"],
        required: true,
      },
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      uploadDate: { type: Date, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OnboardingApplication = mongoose.model<
  IOnboardingApplication,
  IOnboardingApplicationModel
>("OnboardingApplication", OnboardingApplicationSchema);
