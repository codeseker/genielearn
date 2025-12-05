import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import {
  coursePrompt,
  intentSystemPrompt,
  metadataSystemPrompt,
  securityChecks,
} from "../constants/prompts/course";
import { model } from "../config/ai";
import { Course } from "../types/course";
import courseModel from "../models/course";
import moduleModel from "../models/modules";
import lessonModel from "../models/lesson";
import { validateQuery, validateUserQuery } from "../validations/course";
import { GenerativeModel } from "@google/generative-ai";

export const index = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    search = "",
  } = req.query as { page?: string; limit?: string; search?: string };

  const courses = await courseModel.find({
    isDeleted: false,
    createdBy: (req as any).user.id,
  });

  return successResponse(res, {
    message: "Courses fetched successfully",
    data: {
      courses: courses.map((course) => course.toJSON()),
      total: courses.length,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    },
  });
});

async function withRetry(fn: any, retries = 2, delay = 500) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

function cleanJSON(str: string) {
  return str
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();
}

async function classifyIntent(
  model: GenerativeModel,
  userQuery: string
): Promise<{
  intentCategory: string;
  primaryTopic: string;
  reasoning: string;
}> {
  return await withRetry(async () => {
    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: intentSystemPrompt }] },
        { role: "user", parts: [{ text: userQuery }] },
      ],
    });

    const text = response.response.text();
    return JSON.parse(cleanJSON(text));
  });
}

async function generateMetadata(
  model: GenerativeModel,
  intentJSON: any
): Promise<{
  title: string;
  description: string;
  targetAudience: string[];
  estimatedDuration: string;
  tags: string[];
  prerequisites: string[];
}> {
  return await withRetry(async () => {
    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: metadataSystemPrompt }] },
        { role: "user", parts: [{ text: JSON.stringify(intentJSON) }] },
      ],
    });

    const text = response.response.text();
    return JSON.parse(cleanJSON(text));
  });
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { userQuery } = req.body;

  // Validate user query against security checks
  const checks = await validateUserQuery(model, securityChecks, userQuery);

  if (!checks.isValid) {
    return errorResponse(res, {
      message: "Invalid user query from AI model",
      errors: checks.reasons,
    });
  }

  const intent = await classifyIntent(model, userQuery);
  const metadata = await generateMetadata(model, intent);

  successResponse(res, {
    message: "Course metadata generated successfully",
    data: { metadata, intent },
    flag: true,
  });

  // Fire-and-forget async processing with timeout protection
  process.nextTick(async () => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Course processing timeout")), 30000)
    );

    try {
      await Promise.race([
        timeoutPromise,
        (async () => {
          // Create course record
          const courseData = await courseModel.create({
            title: metadata.title,
            description: metadata.description,
            targetAudience: metadata.targetAudience,
            estimatedDuration: metadata.estimatedDuration,
            tags: metadata.tags,
            createdBy: (req as any).user.id,
            intentCategory: intent.intentCategory,
            prerequisites: metadata.prerequisites,
          });

          console.log("Course created:", courseData._id);

          // Generate course content
          const prompt = coursePrompt({ ...metadata, userQuery });
          const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });

          const raw = response.response.text();
          const json: Course = JSON.parse(cleanJSON(raw));

          const moduleInsertData = json.modules.map((mod) => ({
            title: mod.title,
            description: mod.description,
            course: courseData._id,
          }));

          const insertedModules = await moduleModel.insertMany(
            moduleInsertData
          );

          const moduleMap = new Map<string, string>();
          insertedModules.forEach((m) => {
            moduleMap.set(m.title, m._id.toString());
          });

          const lessonsInsertData = json.modules.flatMap((mod) =>
            mod.lessons.map((les) => ({
              title: les.title,
              module: moduleMap.get(mod.title),
              order: les.order,
              description: les.description,
              estimatedMinutes: les.estimatedMinutes,
            }))
          );

          await lessonModel.insertMany(lessonsInsertData);
        })(),
      ]);
    } catch (error: any) {
        console.error("Course processing failed:", error);
    }
  });
});

export const show = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const courseData = await courseModel.findById(courseId).populate({
    path: "modules",
    select: "title description",
    populate: {
      path: "lessons",
      select: "title order description estimatedMinutes",
    },
  });

  if (!courseData) {
    return errorResponse(res, {
      statusCode: 404,
      message: "Course not found",
    });
  }

  return successResponse(res, {
    message: "Course fetched successfully",
    data: {
      course: courseData,
    },
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const courseData = await courseModel.findOne({
    _id: courseId,
    isDeleted: false,
    createdBy: (req as any).user.id,
  });

  if (!courseData) {
    return errorResponse(res, {
      statusCode: 404,
      message: "Course not found",
    });
  }

  courseData.isDeleted = true;
  await courseData.save();

  return successResponse(res, {
    statusCode: 200,
    data: null,
    message: "Course deleted successfully",
  });
});
