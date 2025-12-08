import { GenerativeModel } from "@google/generative-ai";
import { intentSystemPrompt, metadataSystemPrompt } from "../constants/prompts/course";

async function withRetry(fn: any, retries = 2, delay = 500) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

export function cleanJSON(str: string) {
  return str
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();
}

export async function classifyIntent(
  model: GenerativeModel,
  userQuery: string
): Promise<{
  intentCategory: string;
  primaryTopic: string;
  reasoning: string;
}> {
  return await withRetry(async () => {
    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: intentSystemPrompt }] },
        { role: "user", parts: [{ text: userQuery }] },
      ],
    });

    const text = response.response.text();
    return JSON.parse(cleanJSON(text));
  });
}

export async function generateMetadata(
  model: GenerativeModel,
  intentJSON: any
): Promise<{
  title: string;
  description: string;
  targetAudience: string[];
  estimatedDuration: string;
  tags: string[];
  prerequisites: string[];
}> {
  return await withRetry(async () => {
    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: metadataSystemPrompt }] },
        { role: "user", parts: [{ text: JSON.stringify(intentJSON) }] },
      ],
    });

    const text = response.response.text();
    return JSON.parse(cleanJSON(text));
  });
}
