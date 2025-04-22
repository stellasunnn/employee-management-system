import mongoose from "mongoose";
import { IRegistrationToken } from "../types/registration-token.types";

interface IRegistrationTokenModel extends mongoose.Model<IRegistrationToken> {
  // Add any static methods here if needed
}

const RegistrationTokenSchema = new mongoose.Schema<
  IRegistrationToken,
  IRegistrationTokenModel
>({
  token: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ["pending", "registered"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const RegistrationToken = mongoose.model<
  IRegistrationToken,
  IRegistrationTokenModel
>("RegistrationToken", RegistrationTokenSchema);
