import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/api";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  // JWT expired
  if (err.name === "TokenExpiredError") {
    return errorResponse(res, {
      statusCode: 401,
      message: "Token expired",
      errors: ["Token expired"],
    });
  }

  // JWT invalid
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, {
      statusCode: 401,
      message: "Invalid token",
      errors: ["Invalid token"],
    });
  }

  // For custom API errors
  if (err.statusCode) {
    return errorResponse(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }


  // Fallback: Internal Server Error
  return errorResponse(res, {
    statusCode: 500,
    message: "Internal Server Error",
    errors: [err?.message || "Something went wrong"],
  });
};
