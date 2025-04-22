import { Request, Response, NextFunction } from "express";

export const authenticateHR = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Implement proper HR authentication
  // For now, just pass through
  next();
};
