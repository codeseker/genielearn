import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Assessment, AssessmentSchema } from './assessment.model.js';
import { AssessmentAttempt, AssessmentAttemptSchema } from './assessment-attempt.model.js';
import { AssessmentRepository } from './repository/assessment.repository.js';
import { AssessmentAttemptRepository } from './repository/assessment-attempt.repository.js';
import { AssessmentService } from './service/assessment.service.js';
import { AssessmentController } from './assessment.controller.js';
import { ConceptsModule } from '../concepts/concepts.module.js';
import { LearnerModule } from '../learner/learner.module.js';

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
    ConceptsModule,
    LearnerModule,
  ],
  exports: [MongooseModule, AssessmentService],
  providers: [
    AssessmentRepository,
    AssessmentAttemptRepository,
    AssessmentService,
  ],
  controllers: [AssessmentController],
})
export class AssessmentsModule {}
