import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse } from "../utils/api";
import { z } from "zod";
import { GenerativeModel } from "@google/generative-ai";
import Course from "../models/course";
import mongoose from "mongoose";

export const indexValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, search } = req.query;
    const errors: { field: string; message: string }[] = [];

    if (page !== undefined && (isNaN(Number(page)) || Number(page) <= 0)) {
      errors.push({
        field: "page",
        message: "Page must be a positive number",
      });
    }

    if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) <= 0)) {
      errors.push({
        field: "limit",
        message: "Limit must be a positive number",
      });
    }

    if (search !== undefined && typeof search !== "string") {
      errors.push({
        field: "search",
        message: "Search must be a string",
      });
    }

    if (errors.length > 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errors,
      });
    }

    next();
  }
);

const createCourseSchema = z.object({
  prompt: z.string().min(10).max(500),
});

export const createValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { prompt } = req.body;

    const parseResult = createCourseSchema.safeParse({
      prompt,
    });

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));
      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errors,
      });
    }

    next();
  }
);

export const courseIdValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;

    if (!courseId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errors: [{ field: "courseId", message: "Course ID is required" }],
      });
    }

    const schema = z.object({
      courseId: z.string().refine(
        (value: string) => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: "Invalid MongoDB ObjectId",
        }
      ),
    });

    const parseResult = schema.safeParse({
      courseId,
    });

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));
      return errorResponse(res, {
        statusCode: 400,
        message: "Validation Error",
        errors,
      });
    }

    const courseData = await Course.findOne({
      _id: courseId,
      isDeleted: false,
      createdBy: (req as any).user.id,
    });

    if (!courseData) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Course not found",
      });
    }
    
    next();
  }
);

export function validateQuery(query: string): {
  isValid: boolean;
  reasons: string[];
} {
  const reasons = [];

  const q = query.trim().toLowerCase();

  // Length checks
  if (q.length < 10) reasons.push("Query too short.");
  if (q.length > 500) reasons.push("Query too long.");

  // Dangerous keywords
  const dangerousKeywords = [
    "kill",
    "weapon",
    "hack",
    "malware",
    "exploit",
    "ddos",
    "drug",
    "suicide",
    "harm",
    "bomb",
    "terror",
    "jailbreak",
    "bypass",
    "override system",
  ];
  if (dangerousKeywords.some((k) => q.includes(k))) {
    reasons.push("Query contains harmful or dangerous content.");
  }

  // Prompt injection patterns
  const injectionPatterns = [
    "ignore previous",
    "disregard above",
    "system override",
    "act as",
    "you are now",
    "reset your rules",
    "developer mode",
  ];
  if (injectionPatterns.some((k) => q.includes(k))) {
    reasons.push("Prompt injection attempt detected.");
  }

  // Out-of-scope patterns
  const outOfScope = [
    "write code",
    "debug",
    "fix code",
    "calculate",
    "solve",
    "chat with me",
    "joke",
    "story",
    "build a website",
    "make an app",
    "generate poem",
    "tell me",
    "explain this",
  ];
  if (outOfScope.some((k) => q.includes(k))) {
    reasons.push("Query is outside the allowed educational topic scope.");
  }

  // Vague queries
  const vaguePatterns = [
    "help me",
    "anything",
    "something",
    "idk",
    "i dont know",
    "make a course",
    "create a course",
    "i need a course",
  ];
  if (vaguePatterns.some((k) => q === k || q.includes(k))) {
    reasons.push("Query is too vague.");
  }

  // Check if it seems like a proper learning topic
  const invalidTopicIndicators = [
    "run",
    "execute",
    "upload file",
    "download",
    "open",
    "delete",
    "shutdown",
    "restart",
    "cmd",
    "terminal",
    "sql",
    "http",
    "server",
    "database",
    "token",
  ];
  if (invalidTopicIndicators.some((k) => q.includes(k))) {
    reasons.push("Query attempts system/app actions.");
  }

  // If no noun-like structure, it's probably not a topic
  const words = q.split(/\s+/);
  if (words.length < 2) {
    reasons.push("Query has insufficient context for a learning topic.");
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
}

export async function validateUserQuery(
  model: GenerativeModel,
  securityChecks: string,
  userQuery: string
): Promise<{ isValid: boolean; reasons: string[] }> {
  try {
    const checks = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: securityChecks }],
        },
        {
          role: "user",
          parts: [{ text: userQuery }],
        },
      ],
      generationConfig: {
        temperature: 0,
        topK: 1,
        topP: 1,
        maxOutputTokens: 256,
      },
    });

    const responseText =
      checks.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return {
        isValid: false,
        reasons: ["Model returned an empty or invalid response."],
      };
    }

    let json;

    // ---- Safe JSON extraction ----
    try {
      // Many models wrap JSON in ```json ... ```
      const cleaned = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      json = JSON.parse(cleaned);
    } catch (err) {
      return {
        isValid: false,
        reasons: ["Failed to parse validation response as JSON."],
      };
    }

    // ---- Mandatory schema enforcement ----
    if (typeof json.isValid !== "boolean" || !Array.isArray(json.reasons)) {
      return {
        isValid: false,
        reasons: [
          "Validation response JSON structure is incorrect.",
          "Expected: { isValid: boolean, reasons: [] }",
        ],
      };
    }

    return json; // { isValid: true/false, reasons: [...] }
  } catch (err) {
    console.error("Validation Error:", err);

    return {
      isValid: false,
      reasons: ["Validation call failed internally."],
    };
  }
}
