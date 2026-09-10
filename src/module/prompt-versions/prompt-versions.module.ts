import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromptVersion, PromptVersionSchema } from './schema/prompt-version.model.js';
import { PromptVersionRepository } from './repository/prompt-version.repository.js';
import { PromptVersionService } from './service/prompt-version.service.js';

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
  exports: [MongooseModule, PromptVersionService],
  providers: [PromptVersionService, PromptVersionRepository],
})
export class PromptVersionsModule {}
