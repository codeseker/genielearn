import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import { lessonPrompt } from "../constants/prompts/lesson";
import { model } from "../config/ai";
import moduleModel from "../models/modules";
import lesson from "../models/lesson";
import course from "../models/course";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, moduleId, lessonId } = req.body;

  const courseData = await course.findById(courseId);
  if (!courseData) {
    return errorResponse(res, {
      statusCode: 404,
      message: "Course not found",
    });
  }

  const moduleData = await moduleModel
    .findById(moduleId)
    .populate({
      path: "lessons",
      select: "title description order",
    })
    .exec();

  if (!moduleData) {
    return errorResponse(res, {
      statusCode: 404,
      message: "Module not found",
    });
  }

  const lessonData = await lesson.findById(lessonId);
  if (!lessonData) {
    return errorResponse(res, {
      statusCode: 404,
      message: "Lesson not found",
    });
  }
  const content = lessonData.content;
  let isEmpty = false;

  if (typeof content === "string" || content instanceof String) {
    isEmpty = content.toString().trim().length === 0;
  } else if (Array.isArray(content)) {
    isEmpty = content.length === 0;
  } else if (typeof content === "object" && content !== null) {
    isEmpty = Object.keys(content).length === 0;
  } else {
    isEmpty = true;
  }

  if (!isEmpty) {
    return successResponse(res, {
      statusCode: 200,
      message: "Lesson Created Successfully",
      data: {content},
    });
  }

  const upcomingLessons = ((moduleData as any).lessons ?? [])
    .filter(
      (lesson: any) =>
        lesson._id.toString() !== lessonId && lesson.order > lessonData.order
    )
    .sort((a: any, b: any) => a.order - b.order);

  const prompt = lessonPrompt({
    courseTitle: courseData.title,
    moduleTitle: moduleData.title,
    lessonTitle: lessonData.title,
    lessonOrder: lessonData.order,
    upcomingLessons,
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

  const cleaned = JSON.parse(
    JSON.stringify(text)
      .replace(/^```(json)?/i, "")
      .replace(/```$/i, "")
  ).replace(/\\n/g, "\n");

  lessonData.content = cleaned;
  await lessonData.save();

  return successResponse(res, {
    statusCode: 200,
    message: "Lesson created successfully",
    data: { content: cleaned },
  });
});
