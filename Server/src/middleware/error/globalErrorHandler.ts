import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "./AppError";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.issues.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle SyntaxError (invalid JSON in body)
  if (err instanceof SyntaxError && "body" in err && err.message.includes("JSON")) {
     return res.status(400).json({
      success: false,
      error: "Invalid JSON payload",
    });
  }

  // Default to 500
  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
};
