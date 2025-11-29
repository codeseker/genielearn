import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { successResponse } from "../utils/api";
import { coursePrompt } from "../constants/prompts/course";
import { model } from "../config/ai";
import { Course } from "../types/course";
import courseModel from "../models/course";
import moduleModel from "../models/modules";
import lessonModel from "../models/lesson";

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
      content: {
        estimatedMinutes: les.estimatedMinutes,
      },
      module: moduleMap.get(mod.title),
    }))
  );

  await lessonModel.insertMany(lessonsInsertData);

  return successResponse(res, {
    message: "Course, Modules & Lessons created successfully",
    data: {
      courseId: courseData._id,
      totalModules: insertedModules.length,
      totalLessons: lessonsInsertData.length,
    },
  });
});
