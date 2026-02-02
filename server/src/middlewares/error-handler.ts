import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/api";
import { ERROR } from "../utils/error";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // JWT expired
  if (err.name === "TokenExpiredError") {
    return errorResponse(res, {
      statusCode: 401,
      message: "Token expired",
      errors: ["Token expired"],
      errorCode: ERROR.TOKEN_EXPIRED,
    });
  }

  // JWT invalid
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, {
      statusCode: 401,
      message: "Invalid token",
      errors: ["Invalid token"],
      errorCode: ERROR.TOKEN_INVALID,
    });
  }

  // For custom API errors
  if (err.statusCode) {
    return errorResponse(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      errorCode: ERROR.INTERNAL_SERVER_ERROR,
    });
  }

  // Fallback: Internal Server Error
  return errorResponse(res, {
    statusCode: 500,
    message: "Internal Server Error",
    errors: [err?.message || "Something went wrong"],
    errorCode: ERROR.INTERNAL_SERVER_ERROR,
  });
};
