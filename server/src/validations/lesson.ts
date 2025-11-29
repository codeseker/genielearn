import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import z from "zod";
import { errorResponse } from "../utils/api";

const lessonSchema = z.object({
  courseTitle: z.string().min(1, "Course title is required"),
  courseTopic: z.string().min(1, "Course topic is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
  level: z.string().min(1, "Level is required"),
  moduleTitle: z.string().min(1, "Module title is required"),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  lessonDescription: z.string().min(1, "Lesson description is required"),
  lessonOrder: z.number().min(1, "Lesson order must be at least 1"),
  estimatedMinutes: z.number().min(1, "Estimated minutes must be at least 1"),
});

export const createValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      courseTitle,
      courseTopic,
      targetAudience,
      level,
      moduleTitle,
      lessonTitle,
      lessonDescription,
      lessonOrder,
      estimatedMinutes,
    } = req.body;

    const parseResult = lessonSchema.safeParse({
      courseTitle,
      courseTopic,
      targetAudience,
      level,
      moduleTitle,
      lessonTitle,
      lessonDescription,
      lessonOrder,
      estimatedMinutes,
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
