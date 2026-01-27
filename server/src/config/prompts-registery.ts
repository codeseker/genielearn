import {
  intentSystemPromptGemini,
  securityChecksGemini,
  metadataSystemPromptGemini,
  coursePromptGemini,
  lessonPromptGemini,
} from "../constants/prompts/gemini";
import {
  intentSystemPromptGroq,
  metadataSystemPromptGroq,
  securityChecksGroq,
  coursePromptGroq,
  lessonPromptGroq,
} from "../constants/prompts/groq";

export type PromptType =
  | "security"
  | "intent"
  | "metadata"
  | "course"
  | "lesson";

export const PROMPTS = {
  gemini: {
    security: securityChecksGemini,
    intent: intentSystemPromptGemini,
    metadata: metadataSystemPromptGemini,
    course: coursePromptGemini,
    lesson: lessonPromptGemini,
  },

  groq: {
    security: securityChecksGroq,
    intent: intentSystemPromptGroq,
    metadata: metadataSystemPromptGroq,
    course: coursePromptGroq,
    lesson: lessonPromptGroq,
  },
};
