import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { ApiException } from "./api";

const getSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return ApiException({
        statusCode: 501,
        message: "JWT secret is not defined in environment variables.",
    })
  }
  return secret;
};

export const generateToken = (
  payload: object,
  expiresIn: any
): string => {
  return jwt.sign(payload, getSecret(), { expiresIn });
};

export const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, getSecret());
};
