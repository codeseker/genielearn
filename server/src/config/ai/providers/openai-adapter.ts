import OpenAI from "openai";
import type {
  AIModel,
  GenerateContentInput,
  GenerateContentOutput,
} from "../../../types/ai";

export class OpenAIAdapter implements AIModel {
  provider = "openai" as const;
  private client: OpenAI;
  private modelName: string;

  constructor(apiKey: string, baseURL: string, modelName: string) {
    this.client = new OpenAI({ apiKey, baseURL });
    this.modelName = modelName;
  }

  async generateContent(
    input: GenerateContentInput,
  ): Promise<GenerateContentOutput> {
    const messages = input.contents.map((item) => ({
      role: item.role,
      content: item.parts.map((p) => p.text).join("\n"),
    }));

    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content ?? "";

    // 🔑 Normalize to Gemini-like response
    return {
      response: {
        text: () => text,
      },
    };
  }
}
