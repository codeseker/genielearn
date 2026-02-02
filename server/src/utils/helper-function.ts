import path from "path";

import slugify from "slugify";
import { Model, Types, QueryFilter } from "mongoose";
import { getPrompt } from "../config/get-prompt";

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
  model: any,
  userQuery: string,
): Promise<{
  intentCategory: string;
  primaryTopic: string;
  reasoning: string;
}> {
  return await withRetry(async () => {
    const intentSystemPrompt = getPrompt(model, "intent");
    const response = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: intentSystemPrompt }] },
        { role: "user", parts: [{ text: userQuery }] },
      ],
    });

    const text = response.response.text();
    return JSON.parse(cleanJSON(text));
  });
}

export async function generateMetadata(
  model: any,
  intentJSON: any,
): Promise<{
  title: string;
  description: string;
  targetAudience: string[];
  estimatedDuration: string;
  tags: string[];
  prerequisites: string[];
}> {
  return await withRetry(async () => {
    const metadataSystemPrompt = getPrompt(model, "metadata");
    const response = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: metadataSystemPrompt }] },
        { role: "user", parts: [{ text: JSON.stringify(intentJSON) }] },
      ],
    });

    const text = response.response.text();
    return JSON.parse(cleanJSON(text));
  });
}

interface SlugDocument {
  _id: Types.ObjectId;
  slug: string;
}

export async function generateUniqueSlug<T extends SlugDocument>({
  model,
  title,
  id,
}: {
  model: Model<T>;
  title: string;
  id?: string;
}): Promise<string> {
  try {
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    const query: QueryFilter<T> = {
      slug: new RegExp(`^${baseSlug}(-\\d+)?$`, "i"),
    };

    if (id) {
      query._id = { $ne: new Types.ObjectId(id) };
    }

    const existingSlugs = await model
      .find(query)
      .select("slug")
      .lean<{ slug: string }[]>();

    const existingSet = new Set(existingSlugs.map((doc) => doc.slug));

    while (existingSet.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  } catch (error: any) {
    console.log("Error: ", error);
    return "";
  }
}

export const getUploadPath = () => {
  return path.join(__dirname, "../../public/uploads");
};

export const getUniqueFileName = (fileName: string) => {
  const fileExtension = path.extname(fileName);
  const fileNameWithoutExtension = path.basename(fileName, fileExtension);
  const uniqueFileName = `${fileNameWithoutExtension}-${Date.now()}${fileExtension}`;
  return uniqueFileName;
};
