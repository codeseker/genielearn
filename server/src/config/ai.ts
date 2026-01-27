import { GeminiAdapter } from "./ai/providers/gemini-adapter";
import { OpenAIAdapter } from "./ai/providers/openai-adapter";
import { GroqAdapter } from "./ai/providers/groq-adapter";
import type { AIModel } from "../types/ai";

type Provider = "openai" | "gemini" | "groq";

const PROVIDER = (process.env.AI_PROVIDER ?? "groq") as Provider;

let model: AIModel;

switch (PROVIDER) {
  case "openai":
    model = new OpenAIAdapter(
      process.env.AI_API_KEY as string,
      "https://api.aimlapi.com/v1",
      "google/gemma-3-27b-it",
    );
    break;

  case "groq":
    model = new GroqAdapter(
      process.env.GROQ_API_KEY as string,
      "openai/gpt-oss-120b",
    );
    break;

  case "gemini":
  default:
    model = new GeminiAdapter(
      process.env.GEMINI_API_KEY as string,
      "gemini-2.0-flash-lite",
    );
    break;
}

export { model };
