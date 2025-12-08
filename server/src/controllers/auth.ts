import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import User from "../models/user";
import { generateToken, verifyToken } from "../utils/jwt";
import { hashPassword } from "../utils/bcrypt";
import Role from "../models/role";
import { UserStatus } from "../constants/enums/user";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName } = req.body;

  const encryptedPassword = await hashPassword(password);

  const role = await Role.findOne({ name: "regular_user" });
  if (!role) {
    return errorResponse(res, {
      statusCode: 500,
      message: "User role not found. Please contact support.",
    });
  }

  const createdUser = await User.create({
    username,
    email,
    password: encryptedPassword,
    first_name: firstName,
    last_name: lastName,
    status: UserStatus.PENDING,
    role: role._id,
  });

  const accessToken = generateToken(
    { id: createdUser._id, email: email },
    "2h"
  );

  const refreshToken = generateToken({ id: createdUser._id }, "7d");

  User.findByIdAndUpdate(createdUser._id, { refreshToken });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // set true only in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, {
    statusCode: 201,
    message: "User registered successfully.",
    data: { user: createdUser.safeUser(), token: accessToken },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return errorResponse(res, {
      statusCode: 404,
      message: "User not found",
      errors: [{ field: "email", message: "User not found" }],
    });
  }

  const accessToken = generateToken({ id: user._id, email: user.email }, "2h");

  const refreshToken = generateToken({ id: user._id }, "7d");

  await User.findByIdAndUpdate(user._id, { refreshToken });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // Use true in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userData = user.safeUser();

  return successResponse(res, {
    statusCode: 200,
    message: "Login successful",
    data: {
      user: userData,
      token: accessToken,
    },
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  return successResponse(res, {
    statusCode: 200,
    message: "User profile fetched successfully",
    data: { user: user.toJSON() },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await User.findByIdAndUpdate(user._id, { refreshToken: null });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true, // Use true in production
    sameSite: "strict",
  });

  return successResponse(res, {
    statusCode: 200,
    data: null,
    message: "Logout successful",
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Refresh token is missing",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse(res, {
        statusCode: 403,
        message: "Invalid refresh token",
      });
    }

    if (typeof decoded === "string" || !("id" in decoded)) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Unauthorized: Invalid token payload",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return errorResponse(res, {
        statusCode: 403,
        message: "Refresh token not found or expired",
      });
    }

    const newAccessToken = generateToken(
      { id: user._id, email: user.email },
      "2h"
    );

    const newRefreshToken = generateToken({ id: user._id }, "7d");

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { refreshToken: newRefreshToken },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return errorResponse(res, {
        statusCode: 500,
        message: "Something went wrong",
      });
    }

    const finalData = {
      id: updatedUser._id,
      name: updatedUser.first_name + " " + updatedUser.last_name,
      email: updatedUser.email,
      refreshToken: newRefreshToken,
    };

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Token refreshed successfully",
      data: { token: newAccessToken, user: finalData },
    });
  }
);
