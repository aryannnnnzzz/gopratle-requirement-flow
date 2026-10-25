import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle invalid JSON body syntax
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Malformed JSON in request body",
      errors: [{ path: "body", message: "Invalid JSON format" }],
    });
    return;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format in URL param)
  if (err instanceof mongoose.Error.CastError || err.name === "CastError") {
    res.status(404).json({
      success: false,
      message: "Requirement not found",
    });
    return;
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError || err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => ({
      path: e.path,
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // General server error (prevent stack trace leak)
  const isDev = process.env.NODE_ENV === "development";
  console.error("[Unhandled Error]:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(isDev && { debug: err.message }),
  });
};
