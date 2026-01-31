import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import { model } from "../config/ai";
import { Course } from "../types/course";
import courseModel from "../models/course";
import moduleModel from "../models/modules";
import lessonModel from "../models/lesson";
import {
  classifyIntent,
  cleanJSON,
  generateMetadata,
} from "../utils/helper-function";
import { getPrompt } from "../config/get-prompt";
import { validateUserQuery } from "../validations/course";

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
    .populate({
      path: "modules",
      select: "id slug",
      perDocumentLimit: 1,
      options: { sort: { order: 1 } },
      populate: {
        path: "lessons",
        select: "id slug",
        perDocumentLimit: 1,
        options: { sort: { order: 1 } },
      },
    })
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

  const securityChecks = getPrompt(model, "security");

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
  let prompt = getPrompt(model, "course", {
    ...metadata,
    userQuery,
  });
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const raw = response.response.text();
  const json: Course = JSON.parse(cleanJSON(raw));

  const moduleInsertData = json.modules.map((mod, idx) => ({
    title: mod.title,
    description: mod.description,
    course: courseData._id,
    order: idx + 1,
  }));

  const insertedModules = await moduleModel.insertMany(moduleInsertData);

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
    })),
  );

  await lessonModel.insertMany(lessonsInsertData);

  return successResponse(res, {
    message: "Course metadata generated successfully",
    data: {
      title: metadata.title,
      description: metadata.description,
      courseId: courseData._id,
      slug: courseData.slug,
      modules: [
        {
          title: json.modules[0].title,
          description: json.modules[0].description,
          slug: json.modules[0].slug,
          lessons: [
            {
              title: json.modules[0].lessons[0].title,
              description: json.modules[0].lessons[0].description,
              estimatedMinutes: json.modules[0].lessons[0].estimatedMinutes,
              slug: json.modules[0].lessons[0].slug,
            },
          ],
        },
      ],
    },
    flag: true,
  });
});

export const show = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const courseData = await courseModel
    .findOne({
      slug: courseId,
      isDeleted: false,
      createdBy: (req as any).user.id,
    })
    .populate({
      path: "modules",
      select: "title description slug isCompleted",
      populate: {
        path: "lessons",
        select: "title order description estimatedMinutes slug isCompleted",
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
      slug: courseId,
      isDeleted: false,
      createdBy: (req as any).user.id,
    },
    {
      isDeleted: true,
    },
  );
  if (!courseData) {
    return errorResponse(res, {
      statusCode: 404,
      message: "Course not found",
    });
  }

  const allModules = await moduleModel.updateMany(
    { course: courseData._id, isDeleted: false },
    { isDeleted: true },
  );

  const moduleIds = await moduleModel
    .find({ course: courseData._id }, { _id: 1 })
    .lean();

  const ids = moduleIds.map((m) => m._id);

  await lessonModel.updateMany(
    { module: { $in: ids }, isDeleted: false },
    { isDeleted: true },
  );

  return successResponse(res, {
    statusCode: 200,
    data: null,
    message: "Course deleted successfully",
  });
});

export const coursesWithStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
      createdBy: userId,
    };

    const completedLessonIds = await lessonModel
      .find({ user: userId, completed: true })
      .distinct("lesson");

    const completedSet = new Set(completedLessonIds.map(String));

    const courses = await courseModel
      .find(filter)
      .populate({
        path: "modules",
        select: "title order lessons",
        options: { sort: { order: 1 } },
        populate: {
          path: "lessons",
          select: "title order",
          options: { sort: { order: 1 } },
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const coursesWithStats = courses.map((course: any) => {
      const allLessons = course.modules.flatMap((m: any) => m.lessons);

      const totalLessons = allLessons.length;

      const completedLessons = allLessons.reduce(
        (count: number, lesson: any) =>
          completedSet.has(String(lesson._id)) ? count + 1 : count,
        0,
      );

      const progress =
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100);

      return {
        ...course.toObject(),
        stats: {
          totalModules: course.modules.length,
          totalLessons,
          completedLessons,
          progress,
        },
      };
    });

    const totalCourses = await courseModel.countDocuments(filter);

    return successResponse(res, {
      message: "Courses with stats fetched successfully",
      data: {
        courses: coursesWithStats,
        pagination: {
          total: totalCourses,
          page,
          limit,
          totalPages: Math.ceil(totalCourses / limit),
        },
      },
    });
  },
);
