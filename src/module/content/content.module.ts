import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentEvaluation, ContentEvaluationSchema } from './content-evaluation.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContentEvaluation.name,
        schema: ContentEvaluationSchema,
        collection: 'content_evaluations',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class ContentModule {}
