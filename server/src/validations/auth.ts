import { z } from "zod";
import { NextFunction, type Request, type Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse } from "../utils/api";
import User from "../models/user";
import { comparePassword } from "../utils/bcrypt";
import { UserStatus } from "../constants/enums/user";
import { ERROR } from "../utils/error";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
    }: {
      username: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    } = req.body;

    const parseResult = registerSchema.safeParse({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));

      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errorCode: ERROR.REGISTER_VALIDATION,
        errors,
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return errorResponse(res, {
        statusCode: 400,
        message: "User with this email already exists",
        errors: [{ field: "email", message: "Email already in use" }],
        errorCode: ERROR.USER_EMAIL_EXISTS
      });
    }

    next();
  }
);

export const loginValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: { email: string; password: string } = req.body;

    const parseResult = loginSchema.safeParse({ email, password });
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));
      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errorCode: ERROR.LOGIN_VALIDATION,
        errors,
      });
    }

    
    const user = await User.findOne({ email });
    
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User not found",
        errors: [{ field: "email", message: "User not found" }],
        errorCode: ERROR.USER_NOT_FOUND
      });
    }

    if(user.isDeleted || user.status === UserStatus.INACTIVE) {
      return errorResponse(res, {
        statusCode: 401,
        message: "User account is inactive or deleted",
        errors: [{ field: "email", message: "Account inactive or deleted" }],
        errorCode: ERROR.USER_ACCOUNT_INACTIVE
      });
    }

    const isSafe = await comparePassword(password, user.password);
    
    if (!isSafe) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid credentials",
        errors: [{ field: "password", message: "Incorrect password" }],
        errorCode: ERROR.USER_PASSWORD_NOT_MATCH
      });
    }

    next();
  }
);
