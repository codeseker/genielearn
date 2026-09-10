import { Injectable } from '@nestjs/common';
import { BaseLLMService } from './base-llm.service.js';
import { z } from 'zod';

type Params<T> = {
  systemPrompt: string;
  userInput: string;
  outputSchema: T;
  model?: string;
};

@Injectable()
export class LlmClientService {
  constructor(private readonly baseLlmService: BaseLLMService) {}

  async callStructured<T extends z.ZodTypeAny>(
    params: Params<T>,
  ): Promise<{
    data: z.infer<T>;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
  }> {
    return this.baseLlmService.callStructured(params);
  }
}
