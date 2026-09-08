import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromptVersion, PromptVersionSchema } from './prompt-version.model.js';

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
})
export class PromptsModule {}
