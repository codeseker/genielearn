import User from "../models/user";
import { errorResponse, successResponse } from "../utils/api";
import { asyncHandler } from "../utils/async-handler";
import { Request, Response } from "express";
import { getUniqueFileName, getUploadPath } from "../utils/helper-function";
import { UploadedFile } from "express-fileupload";
import Upload from "../models/uploads";
import { ERROR } from "../utils/error";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = (req as any).user.id;

  const user = await User.findById(id).populate([
    { path: "avatar", select: "url" },
    { path: "totalCourses" },
    { path: "completedCourses" },
    { path: "pendingCourses" },
  ]);

  if (!user) {
    return errorResponse(res, {
      statusCode: 404,
      message: "User not found",
      errors: [{ field: "id", message: "User not found" }],
      errorCode: ERROR.USER_NOT_FOUND
    });
  }

  return successResponse(res, {
    statusCode: 200,
    message: "User profile fetched successfully",
    data: {
      user: { ...user.safeUser(), avatar: user.avatar },
      stats: {
        totalCourses: user?.totalCourses || 0,
        completedCourses: user?.completedCourses || 0,
        pendingCourses: user?.pendingCourses || 0,
      },
    },
  });
});

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const id = (req as any).user.id;

    const user = await User.findById(id).populate("avatar");
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User not found",
        errors: [{ field: "id", message: "User not found" }],
        errorCode: ERROR.USER_NOT_FOUND
      });
    }

    if (!req.files || !req.files.avatar) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Avatar is required",
        errors: [{ field: "avatar", message: "Avatar is required" }],
        errorCode: ERROR.AVATAR_REQUIRED
      });
    }

    const avatar = req.files.avatar as UploadedFile;

    if (!avatar.mimetype.startsWith("image/")) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Only image files are allowed",
        errors: [{ field: "avatar", message: "Invalid file type" }],
        errorCode: ERROR.ONLY_IMAGES_ALLOWED,
      });
    }

    const fileName = getUniqueFileName(avatar.name);
    const uploadDir = getUploadPath();
    const uploadPath = `${uploadDir}/${fileName}`;

    await avatar.mv(uploadPath);

    const uploadDoc = await Upload.create({
      url: `/uploads/${fileName}`,
      key: fileName,
      mimeType: avatar.mimetype,
      size: avatar.size,
      originalName: avatar.name,
      fileType: "IMAGE",
      ownerType: "USER",
      owner: user._id,
      uploadedBy: user._id,
    });

    if (user.avatar) {
      const oldUpload = await Upload.findById(user.avatar);
      if (oldUpload) {
        const fs = await import("fs");
        const oldPath = `.${oldUpload.url}`;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        await oldUpload.deleteOne();
      }
    }

    user.avatar = uploadDoc._id as any;
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Avatar uploaded successfully",
      data: {
        _id: uploadDoc._id,
        url: uploadDoc.url,
      },
    });
  },
);
