import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/api";
import { asyncHandler } from "../utils/async-handler";
import { verifyToken } from "../utils/jwt";
import User from "../models/user";
import { JwtPayload } from "jsonwebtoken";
import { ERROR } from "../utils/error";

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Unauthorized: No token provided",
        errorCode: ERROR.TOKEN_NOT_FOUND
      });
    }

    const token = authorization.split(" ")[1];
    const decoded = verifyToken(token);

    if (typeof decoded === "string" || !("id" in decoded)) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Unauthorized: Invalid token payload",
        errorCode: ERROR.TOKEN_INVALID
      });
    }

    const user = await User.findById((decoded as JwtPayload).id);
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User not found",
        errorCode: ERROR.USER_NOT_FOUND
      });
    }

    (req as any).user = user.toJSON();
    next();
  }
);
