import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse } from "../utils/api";
import { z } from "zod";

export const indexValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, search } = req.query;
    const errors: { field: string; message: string }[] = [];

    if (page !== undefined && (isNaN(Number(page)) || Number(page) <= 0)) {
      errors.push({
        field: "page",
        message: "Page must be a positive number",
      });
    }

    if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) <= 0)) {
      errors.push({
        field: "limit",
        message: "Limit must be a positive number",
      });
    }

    if (search !== undefined && typeof search !== "string") {
      errors.push({
        field: "search",
        message: "Search must be a string",
      });
    }

    if (errors.length > 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errors,
      });
    }

    next();
  }
);

const courseSchema = z.object({
  userQuery: z
    .string()
    .min(10, "User query must be at least 10 characters long"),
  level: z.string().min(3, "Level must be at least 3 characters long"),
  targetAudience: z
    .string()
    .min(3, "Target audience must be at least 3 characters long"),
  duration: z.string().min(1, "Duration must be at least 1 hour"),
  topicType: z.string().min(3, "Topic type must be at least 3 characters long"),
});

export const createValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userQuery, level, targetAudience, duration, topicType } = req.body;

    const parseResult = courseSchema.safeParse({
      userQuery,
      level,
      targetAudience,
      duration,
      topicType,
    });

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));
      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errors,
      });
    }

    next();
  }
);
