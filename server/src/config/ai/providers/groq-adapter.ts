import Groq from "groq-sdk";
import type {
  AIModel,
  GenerateContentInput,
  GenerateContentOutput,
} from "../../../types/ai";

export class GroqAdapter implements AIModel {
  provider = "groq" as const;
  private client: Groq;
  private modelName: string;

  constructor(apiKey: string, modelName: string) {
    this.client = new Groq({ apiKey });
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
      max_completion_tokens: 6000,
    });

    const text = completion.choices[0]?.message?.content ?? "";

    return {
      response: {
        text: () => text,
      },
    };
  }
}
