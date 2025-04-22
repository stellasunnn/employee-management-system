export interface IRegistrationToken {
  token: string;
  email: string;
  name: string;
  expiresAt: Date;
  status: "pending" | "registered";
  createdAt: Date;
}
