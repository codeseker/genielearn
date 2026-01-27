import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AIModel,
  GenerateContentInput,
  GenerateContentOutput,
} from "../../../types/ai";

export class GeminiAdapter implements AIModel {
  provider = "gemini" as const;
  private model;

  constructor(apiKey: string, modelName: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  async generateContent(
    input: GenerateContentInput,
  ): Promise<GenerateContentOutput> {
    const response = await this.model.generateContent(input);

    return {
      response: {
        text: () => response.response.text(),
      },
    };
  }
}
