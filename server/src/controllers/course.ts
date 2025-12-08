import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import { coursePrompt, securityChecks } from "../constants/prompts/course";
import { model } from "../config/ai";
import { Course } from "../types/course";
import courseModel from "../models/course";
import moduleModel from "../models/modules";
import lessonModel from "../models/lesson";
import { validateQuery, validateUserQuery } from "../validations/course";
import {
  classifyIntent,
  cleanJSON,
  generateMetadata,
} from "../utils/helper-function";

export const index = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    search = "",
  } = req.query as { page?: string; limit?: string; search?: string };

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {
    isDeleted: false,
    createdBy: (req as any).user.id,
  };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  const total = await courseModel.countDocuments(filter);

  const courses = await courseModel
    .find(filter)
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(total / limitNumber);

  return successResponse(res, {
    message: "Courses fetched successfully",
    data: {
      courses: courses.map((course) => course.toJSON()),
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    },
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { prompt: userQuery } = req.body;

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

  successResponse(res, {
    message: "Course metadata generated successfully",
    data: {
      title: metadata.title,
      description: metadata.description,
      courseId: courseData._id,
    },
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

  const courseData = await courseModel
    .findOne({
      _id: courseId,
      isDeleted: false,
      createdBy: (req as any).user.id,
    })
    .populate({
      path: "modules",
      select: "title description",
      populate: {
        path: "lessons",
        select: "title order description estimatedMinutes",
      },
    });

  return successResponse(res, {
    message: "Course fetched successfully",
    data: {
      course: courseData,
    },
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const courseData = await courseModel.findOneAndUpdate(
    {
      _id: courseId,
      isDeleted: false,
      createdBy: (req as any).user.id,
    },
    {
      isDeleted: true,
    }
  );

  const allModules = await moduleModel.updateMany(
    { course: courseId, isDeleted: false },
    { isDeleted: true }
  );

  const moduleIds = await moduleModel
    .find({ course: courseId }, { _id: 1 })
    .lean();

  const ids = moduleIds.map((m) => m._id);

  await lessonModel.updateMany(
    { module: { $in: ids }, isDeleted: false },
    { isDeleted: true }
  );

  return successResponse(res, {
    statusCode: 200,
    data: null,
    message: "Course deleted successfully",
  });
});
