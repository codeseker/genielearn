import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromptVersion, PromptVersionSchema } from './prompt-version.model.js';
import { PromptService } from './service/prompt.service.js';
import { PromptVersionService } from './service/promptVersion.service.js';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PromptVersion.name,
        schema: PromptVersionSchema,
        collection: 'prompt_versions',
      },
    ]),
  ],
  exports: [MongooseModule],
  providers: [PromptService, PromptVersionService],
})
export class PromptsModule {}
