import type { AIModel } from "../types/ai";
import { PROMPTS, PromptType } from "./prompts-registery";

export function getPrompt(model: AIModel, type: PromptType, payload?: any) {
  const providerPrompts = (PROMPTS as any)[model.provider];

  if (!providerPrompts) {
    throw new Error(`No prompts registered for ${model.provider}`);
  }

  const prompt = providerPrompts[type];

  if (typeof prompt === "function") {
    return prompt(payload);
  }

  return prompt;
}
