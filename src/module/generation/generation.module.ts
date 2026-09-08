import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GenerationJob, GenerationJobSchema } from './generation-job.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GenerationJob.name,
        schema: GenerationJobSchema,
        collection: 'generation_jobs',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class GenerationModule {}
