import { Request, Response, NextFunction } from "express";
import { isDbConnected } from "../config/db";

export const requireDbConnection = (_req: Request, res: Response, next: NextFunction): void => {
  if (!isDbConnected()) {
    res.status(503).json({
      success: false,
      message: "Database service is currently unavailable. Please try again shortly.",
      errors: [
        {
          path: "database",
          message: "Database connection is not ready",
        },
      ],
    });
    return;
  }
  next();
};
