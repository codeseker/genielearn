import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import User from "../models/user";
import { generateToken, verifyToken } from "../utils/jwt";
import { hashPassword } from "../utils/bcrypt";
import Role from "../models/role";
import { AuthProviders, UserStatus } from "../constants/enums/user";
import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import Upload from "../models/uploads";
import jwt from "jsonwebtoken";

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
    "2h",
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

  const user = await User.findOne({ email }).populate([
    { path: "avatar", select: "url" },
  ]);

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
      user: { ...userData, avatar: user.avatar },
      token: accessToken,
    },
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
      "2h",
    );

    const newRefreshToken = generateToken({ id: user._id }, "7d");

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { refreshToken: newRefreshToken },
      {
        new: true,
      },
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
  },
);

export const socialLoginGoogle = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.body;

    if (!code) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Authorization code missing",
        errors: [{ field: "code", message: "Authorization code missing" }],
      });
    }

    const tokenRes = await axios.post(ENDPOINTS.GOOGLE_OAUTH, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { id_token, access_token } = tokenRes.data as any;

    // 🔐 Validate ID token (minimum safety)
    const decoded: any = jwt.decode(id_token);
    if (
      decoded?.aud !== process.env.GOOGLE_CLIENT_ID ||
      decoded?.iss !== "https://accounts.google.com"
    ) {
      throw new Error("Invalid Google token");
    }

    const userInfoRes = await axios.get(ENDPOINTS.GOOGLE_USERINFO, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const {
      sub: googleId,
      email,
      given_name,
      family_name,
      picture,
    } = userInfoRes.data as any;

    let user = await User.findOne({
      $or: [{ authProvider: "google", authProviderId: googleId }, { email }],
    });

    if (!user) {
      user = await User.create({
        username: email.split("@")[0],
        first_name: given_name,
        last_name: family_name,
        email,
        status: UserStatus.ACTIVE,
        authProvider: "google",
        authProviderId: googleId,
      });
    } else if (!user.authProviderId) {
      user.authProvider = AuthProviders.GOOGLE;
      user.authProviderId = googleId;
    }

    const accessToken = generateToken(
      { id: user._id, email: user.email },
      "2h",
    );

    const refreshToken = generateToken({ id: user._id }, "7d");

    user.refreshToken = refreshToken;

    if (picture) {
      if (user.avatar) {
        await Upload.findByIdAndUpdate(
          user.avatar,
          {
            url: picture,
            originalName: "google-avatar",
            mimeType: "image/*",
            fileType: "IMAGE",
            isPublic: true,
          },
          { new: true },
        );
      } else {
        const uploadDoc = await Upload.create({
          url: picture,
          originalName: "google-avatar",
          fileType: "IMAGE",
          ownerType: "USER",
          owner: user._id,
          uploadedBy: user._id,
          isPublic: true,
        });

        user.avatar = uploadDoc._id as any;
      }
    }

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Login successful",
      data: {
        user: { ...user.safeUser(), avatar: picture },
        token: accessToken,
      },
    });
  },
);
