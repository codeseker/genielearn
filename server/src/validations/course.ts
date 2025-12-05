import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse } from "../utils/api";
import { z } from "zod";
import { GenerativeModel } from "@google/generative-ai";

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

const courseSchema = z.object({
  userQuery: z
    .string()
    .min(10, "User query must be at least 10 characters long"),
  level: z.string().min(3, "Level must be at least 3 characters long"),
  targetAudience: z
    .string()
    .min(3, "Target audience must be at least 3 characters long"),
  duration: z.string().min(1, "Duration must be at least 1 hour"),
  topicType: z.string().min(3, "Topic type must be at least 3 characters long"),
});

export const createValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userQuery, level, targetAudience, duration, topicType } = req.body;

    const parseResult = courseSchema.safeParse({
      userQuery,
      level,
      targetAudience,
      duration,
      topicType,
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
