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
import { ERROR } from "../utils/error";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName } = req.body;

  const encryptedPassword = await hashPassword(password);

  const role = await Role.findOne({ name: "regular_user" });
  if (!role) {
    return errorResponse(res, {
      statusCode: 500,
      message: "User role not found. Please contact support.",
      errorCode: ERROR.USER_ROLE_NOT_FOUND,
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
    authProvider: AuthProviders.LOCAL,
  });

  const accessToken = generateToken(
    { id: createdUser._id, email: email },
    process.env.ACCESS_TOKEN_EXPIRES_IN,
  );

  const refreshToken = generateToken(
    { id: createdUser._id },
    process.env.REFRESH_TOKEN_EXPIRES_IN,
  );

  User.findByIdAndUpdate(createdUser._id, { refreshToken });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: Boolean(process.env.REFRESH_COOKIE_SECURE),
    sameSite: process.env.REFRESH_COOKIE_SAMESITE as "lax" | "strict" | "none",
    maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
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
      errorCode: ERROR.USER_NOT_FOUND
    });
  }

  const accessToken = generateToken(
    { id: user._id, email: email },
    process.env.ACCESS_TOKEN_EXPIRES_IN,
  );

  const refreshToken = generateToken(
    { id: user._id },
    process.env.REFRESH_TOKEN_EXPIRES_IN,
  );

  await User.findByIdAndUpdate(user._id, { refreshToken });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: Boolean(process.env.REFRESH_COOKIE_SECURE),
    sameSite: process.env.REFRESH_COOKIE_SAMESITE as "lax" | "strict" | "none",
    maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
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
    secure: Boolean(process.env.REFRESH_COOKIE_SECURE),
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
        errorCode: ERROR.REFRESH_TOKEN_NOT_FOUND
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid refresh token",
        errorCode: ERROR.REFRESH_TOKEN_INVALID
      });
    }

    if (typeof decoded === "string" || !("id" in decoded)) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Unauthorized: Invalid token payload",
        errorCode: ERROR.TOKEN_INVALID
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Refresh token not found or expired",
        errorCode: ERROR.REFRESH_TOKEN_NOT_FOUND
      });
    }

    const newAccessToken = generateToken(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_EXPIRES_IN,
    );

    const newRefreshToken = generateToken(
      { id: user._id },
      process.env.REFRESH_TOKEN_EXPIRES_IN,
    );

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { refreshToken: newRefreshToken },
      {
        new: true,
      },
    );

    if (!updatedUser) {
      return errorResponse(res, {
        statusCode: 401,
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
      secure: Boolean(process.env.REFRESH_COOKIE_SECURE),
      sameSite: process.env.REFRESH_COOKIE_SAMESITE as
        | "lax"
        | "strict"
        | "none",
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
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
        errorCode: ERROR.AUTHORIZATION_CODE_MISSING
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
      process.env.ACCESS_TOKEN_EXPIRES_IN,
    );

    const refreshToken = generateToken(
      { id: user._id },
      process.env.REFRESH_TOKEN_EXPIRES_IN,
    );

    user.refreshToken = refreshToken;

    let avatarId = null;

    if (picture) {
      if (user.avatar) {
        const avt = await Upload.findByIdAndUpdate(
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

        if (!avt) {
          return errorResponse(res, {
            statusCode: 500,
            message: "Something went wrong",
            errors: [{ field: "avatar", message: "Something went wrong" }],
            errorCode: ERROR.INTERNAL_SERVER_ERROR
          });
        }

        avatarId = avt._id;
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

        if (!uploadDoc) {
          return errorResponse(res, {
            statusCode: 500,
            message: "Something went wrong",
            errors: [{ field: "avatar", message: "Something went wrong" }],
            errorCode: ERROR.INTERNAL_SERVER_ERROR
          });
        }

        avatarId = uploadDoc._id;
        user.avatar = uploadDoc._id as any;
      }
    }

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: Boolean(process.env.REFRESH_COOKIE_SECURE),
      sameSite: process.env.REFRESH_COOKIE_SAMESITE as
        | "lax"
        | "strict"
        | "none",
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Login successful",
      data: {
        user: {
          ...user.safeUser(),
          avatar: {
            _id: avatarId,
            url: picture,
          },
        },
        token: accessToken,
      },
    });
  },
);
