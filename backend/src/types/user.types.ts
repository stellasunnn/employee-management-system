import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
