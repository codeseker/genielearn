import { z } from 'zod';

export interface LlmCallParams<T extends z.ZodTypeAny> {
  systemPrompt: string;
  userInput: string;
  outputSchema: T;
  model?: string;
}

export interface LlmCallResult<T> {
  data: T;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export abstract class BaseLLMService {
  abstract readonly providerName: string;
  abstract callStructured<T extends z.ZodTypeAny>(
    params: LlmCallParams<T>,
  ): Promise<LlmCallResult<z.infer<T>>>;
}
