import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";
import { errorResponse } from "../utils/api";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if (err instanceof ApiError) {
  //   return errorResponse(res, {
  //     statusCode: err.statusCode,
  //     message: err.message,
  //     errors: err.errors,
  //   });
  // }
  // console.log("UNHANDELLED: ", err, " Request: ", req.url);

  return errorResponse(res, {
    statusCode: err.statusCode,
    message: err.message,
    errors: err.errors,
  });


  return errorResponse(res, {
    statusCode: 500,
    message: "Internal Server Error",
    errors: [err?.message || "Something went wrong"],
  });
};
