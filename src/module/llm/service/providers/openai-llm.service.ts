import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { z } from 'zod';
import {
  BaseLLMService,
  LlmCallParams,
  LlmCallResult,
} from '../base-llm.service.js';

const DEFAULT_MODEL = 'gpt-4.1';

function extractUsageMetadata(
  response: { lc_attributes?: Record<string, unknown> } & Record<
    string,
    unknown
  >,
): { inputTokens: number; outputTokens: number } {
  // LangChain response usage metadata field names differ by provider/version.
  // Check multiple possible shapes and default to 0 if absent.
  const metadata = response as Record<string, unknown>;

  // Shape 1: response.usage_metadata
  const usageMetadata = metadata['usage_metadata'] as
    { input_tokens?: number; output_tokens?: number } | undefined;
  if (
    usageMetadata?.input_tokens != null &&
    usageMetadata?.output_tokens != null
  ) {
    return {
      inputTokens: usageMetadata.input_tokens,
      outputTokens: usageMetadata.output_tokens,
    };
  }

  // Shape 2: response.response_metadata.usage
  const responseMetadata = metadata['response_metadata'] as
    | {
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
        };
      }
    | undefined;
  if (
    responseMetadata?.usage &&
    (responseMetadata.usage.prompt_tokens != null ||
      responseMetadata.usage.completion_tokens != null)
  ) {
    return {
      inputTokens: responseMetadata.usage.prompt_tokens ?? 0,
      outputTokens: responseMetadata.usage.completion_tokens ?? 0,
    };
  }

  // Shape 3: response.response_metadata directly with token fields
  const directTokens = metadata['response_metadata'] as
    { prompt_tokens?: number; completion_tokens?: number } | undefined;
  if (
    directTokens?.prompt_tokens != null ||
    directTokens?.completion_tokens != null
  ) {
    return {
      inputTokens: directTokens.prompt_tokens ?? 0,
      outputTokens: directTokens.completion_tokens ?? 0,
    };
  }

  return { inputTokens: 0, outputTokens: 0 };
}

@Injectable()
export class OpenAILLM extends BaseLLMService {
  readonly providerName = 'openai';

  constructor(private readonly nestConfigService: NestConfigService) {
    super();
  }

  async callStructured<T extends z.ZodTypeAny>(
    params: LlmCallParams<T>,
  ): Promise<LlmCallResult<z.infer<T>>> {
    const startTime = Date.now();
    const model = params.model ?? DEFAULT_MODEL;

    let chatModel: ChatOpenAI;
    try {
      const apiKey = this.nestConfigService.get('OPENAI_API_KEY');
      if (!apiKey) {
        throw new Error(
          `OpenAI API key (OPENAI_API_KEY) is not configured. Cannot initialize ChatOpenAI model.`,
        );
      }
      chatModel = new ChatOpenAI({
        apiKey: apiKey as string,
        model,
        temperature: 0,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while initializing OpenAI LLM';
      throw new Error(`OpenAILLM provider error (${model}): ${message}`);
    }

    let llmResult: z.infer<T>;
    let response: unknown;
    try {
      const structuredChatModel = chatModel.withStructuredOutput(
        params.outputSchema,
      );
      response = await structuredChatModel.invoke([
        new SystemMessage(params.systemPrompt),
        new HumanMessage(params.userInput),
      ]);
      llmResult = (response as unknown as { parsed: z.infer<T> }).parsed;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during OpenAI LLM structured call';
      throw new Error(`OpenAILLM call failed for model "${model}": ${message}`);
    }

    const latencyMs = Date.now() - startTime;

    const responseMetadata = response as Record<string, unknown>;
    const { inputTokens, outputTokens } =
      extractUsageMetadata(responseMetadata);

    return {
      data: llmResult,
      inputTokens,
      outputTokens,
      latencyMs,
    };
  }
}
