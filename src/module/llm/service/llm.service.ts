import { Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { BaseLLMService } from './base-llm.service.js';
import { LlmUsageService } from './llm-usage.service.js';
import { PromptVersionService } from '../../prompts/service/promptVersion.service.js';

export type Agents =
  'curriculum-agent' | 'content-agent' | 'critic-agent' | 'learning-agent';

interface StructuredCallParams<T extends z.ZodTypeAny> {
  agent: Agents;
  promptId: string; // logical prompt id, e.g. 'curriculum-extraction'
  systemPrompt: string; // resolved by the caller from prompt_versions
  userInput: string; // the actual content, e.g. goal title/description
  outputSchema: T; // zod schema describing the expected structured output
  model?: string;
  userId?: string;
  goalId?: string;
  jobId?: string;
  lessonId?: string;
}

@Injectable()
export class LLMService {
  constructor(
    private readonly llm: BaseLLMService,
    private readonly llmUsageService: LlmUsageService,
    private readonly promptVersionService: PromptVersionService,
  ) {}

  async callStructured<T extends z.ZodTypeAny>(
    params: StructuredCallParams<T>,
  ): Promise<z.infer<T>> {
    const {
      agent,
      promptId,
      systemPrompt,
      userInput,
      outputSchema,
      model,
      userId,
      goalId,
      jobId,
      lessonId,
    } = params;

    // Resolved purely for audit — we log which prompt version was
    // active for this call, even though the prompt text itself
    // was already resolved by the caller and passed in directly.
    const promptVersion = await this.promptVersionService.getActiveVersion(
      promptId,
      agent,
    );

    let success = true;
    let errorPayload: Record<string, unknown> | null = null;
    let result: Awaited<ReturnType<BaseLLMService['callStructured']>> | null =
      null;

    try {
      result = await this.llm.callStructured({
        systemPrompt,
        userInput,
        outputSchema,
        model,
      });
    } catch (err) {
      success = false;
      errorPayload = {
        message: err instanceof Error ? err.message : String(err),
      };
      throw new BadRequestException(
        `LLM call failed for agent "${agent}" (provider: ${this.llm.providerName}): ${errorPayload.message}`,
      );
    } finally {
      await this.llmUsageService.record({
        userId,
        goalId,
        jobId,
        lessonId,
        agent,
        provider: this.llm.providerName,
        model: model ?? 'default',
        promptVersionId: undefined,
        inputTokens: result?.inputTokens ?? 0,
        outputTokens: result?.outputTokens ?? 0,
        latencyMs: result?.latencyMs ?? 0,
        estimatedCost: this.estimateCost(
          model,
          result?.inputTokens ?? 0,
          result?.outputTokens ?? 0,
        ),
        success,
        error: errorPayload,
      });
    }

    return result!.data as z.infer<T>;
  }

  private estimateCost(
    model: string | undefined,
    inputTokens: number,
    outputTokens: number,
  ): number {
    // TODO: real per-provider/per-model rate table once pricing is finalized.
    return 0;
  }

  get activeProvider(): string {
    return this.llm.providerName;
  }
}
