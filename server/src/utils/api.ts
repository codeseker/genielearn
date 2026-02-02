import { Response } from "express";
import { ApiResponse } from "./api-response";
import { ApiError } from "./api-error";

export const successResponse = <T>(
  res: Response,
  {
    flag = false,
    statusCode = 200,
    data,
    message = "Success",
  }: { statusCode?: number; data: T; message?: string, flag?: boolean }
) => {
  if(!flag) {
    return res
      .status(statusCode)
      .json(new ApiResponse({ statusCode, data, message }));
  } else {
    res
      .status(statusCode)
      .json(new ApiResponse({ statusCode, data, message }));
  }
};

export const errorResponse = (
  res: Response,
  {
    statusCode = 500,
    message = "Something went wrong",
    errors = [],
    errorCode = "INTERNAL_SERVER_ERROR"
  }: {
    statusCode?: number;
    message?: string;
    errors?: any[];
    errorCode?: string,
  }
) => {
  return res.status(statusCode).json({
    statusCode,
    data: null,
    success: false,
    message,
    errors,
    errorCode
  });
};

// Helper for throwing structured API errors anywhere
export const ApiException = ({
  statusCode,
  message,
  errors = [],
}: {
  statusCode: number;
  message: string;
  errors?: any[];
}) => {
  throw new ApiError({ statusCode, message, errors });
};
