import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningEvidence, LearningEvidenceSchema } from './learning-evidence.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LearningEvidence.name,
        schema: LearningEvidenceSchema,
        collection: 'learning_evidence',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class EvidenceModule {}
