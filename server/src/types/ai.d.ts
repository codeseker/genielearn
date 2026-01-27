export type GenerateContentInput = {
  contents: {
    role: "system" | "user" | "assistant";
    parts: {
      text: string;
    }[];
  }[];
};

export type GenerateContentOutput = {
  response: {
    text: () => string;
  };
};

export interface AIModel {
  provider: "gemini" | "groq" | "openai";

  generateContent(input: GenerateContentInput): Promise<GenerateContentOutput>;
}
