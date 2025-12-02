import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import { coursePrompt } from "../constants/prompts/course";
import { model } from "../config/ai";
import { Course } from "../types/course";
import courseModel from "../models/course";
import moduleModel from "../models/modules";
import lessonModel from "../models/lesson";

/*
 * Retrieves a paginated, filterable, and sortable list of courses.
 * Designed for lightweight sidebar rendering on the frontend.
 */

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

/*
    - Create a new Course along with its Modules and Lessons
    - The course structure is generated using an AI model based on user input
    - The generated data is then parsed and stored in the database
*/
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { userQuery, level, targetAudience, duration, topicType } = req.body;

  const prompt = coursePrompt({
    userQuery,
    level,
    targetAudience,
    duration,
    topicType,
  });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = response.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();

  let json: Course = JSON.parse(cleaned);

  const courseData = new courseModel({
    title: json.title,
    topic: json.topic,
    level: json.level,
    targetAudience: json.targetAudience,
    estimatedDurationHours: json.estimatedDurationHours,
    description: json.description,
    tags: json.tags,
    createdBy: (req as any).user.id,
  });

  await courseData.save();

  const moduleInsertData = json.modules.map((mod) => ({
    title: mod.title,
    description: mod.description,
    course: courseData._id,
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
    }))
  );

  await lessonModel.insertMany(lessonsInsertData);

  return successResponse(res, {
    message: "Course, Modules & Lessons created successfully",
    data: {
      courseId: courseData._id,
      title: courseData.title,
      totalModules: insertedModules.length,
      totalLessons: lessonsInsertData.length,
    },
  });
});

/*
  - Get Single course by ID along with its Modules and Lessons
  - Populates the course structure for detailed view on the frontend
*/
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
