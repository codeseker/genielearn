import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LLMUsage, LLMUsageSchema } from './llm-usage.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LLMUsage.name,
        schema: LLMUsageSchema,
        collection: 'llm_usage',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class LlmModule {}
