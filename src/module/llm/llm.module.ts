import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LLMUsage, LLMUsageSchema } from './llm-usage.model.js';
import { LlmController } from './llm.controller.js';
import { LlmUsageController } from './llm-usage.controller.js';
import { ConfigModule } from '../../config/config.module.js';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { LlmClientService } from './service/llm-client.service.js';
import { LlmUsageService } from './service/llm-usage.service.js';
import { BaseLLMService } from './service/base-llm.service.js';
import { OpenAILLM } from './service/providers/openai-llm.service.js';
import { AnthropicLLM } from './service/providers/anthropic-llm.service.js';
import { GroqLLM } from './service/providers/groq-llm.service.js';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: LLMUsage.name,
        schema: LLMUsageSchema,
        collection: 'llm_usage',
      },
    ]),
  ],
  exports: [MongooseModule, BaseLLMService, OpenAILLM, AnthropicLLM, GroqLLM, LlmClientService, LlmUsageService],
  providers: [
    OpenAILLM,
    AnthropicLLM,
    GroqLLM,
    LlmClientService,
    LlmUsageService,
    {
      provide: BaseLLMService,
      useFactory: (
        openai: OpenAILLM,
        anthropic: AnthropicLLM,
        groq: GroqLLM,
        config: NestConfigService,
      ) => {
        const provider = config.get('LLM_PROVIDER', 'anthropic') as string;
        switch (provider) {
          case 'openai':
            return openai;
          case 'groq':
            return groq;
          case 'anthropic':
            return anthropic;
          default:
            // Log a warning and fall back to anthropic
            const fallbackMsg = `Unrecognized LLM_PROVIDER value "${provider}" — falling back to 'anthropic'`;
            console.warn(fallbackMsg);
            return anthropic;
        }
      },
      inject: [OpenAILLM, AnthropicLLM, GroqLLM, NestConfigService],
    },
  ],
  controllers: [LlmController, LlmUsageController],
})
export class LlmModule {}
