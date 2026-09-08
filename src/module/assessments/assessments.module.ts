import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Assessment, AssessmentSchema } from './assessment.model.js';
import { AssessmentAttempt, AssessmentAttemptSchema } from './assessment-attempt.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Assessment.name,
        schema: AssessmentSchema,
        collection: 'assessments',
      },
      {
        name: AssessmentAttempt.name,
        schema: AssessmentAttemptSchema,
        collection: 'assessment_attempts',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class AssessmentsModule {}
