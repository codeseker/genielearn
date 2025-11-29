import { Request, Response } from "express";
import { successResponse } from "../utils/api";
import { asyncHandler } from "../utils/async-handler";
import moduleModel from "../models/modules";

export const index = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const allModules = await moduleModel.find({ course: courseId }).populate([
    {
      path: "lessons",
      select: "title order description estimatedMinutes",
    },
  ]);

  return successResponse(res, {
    message: "Modules fetched successfully",
    data: { modules: allModules },
  });
});
