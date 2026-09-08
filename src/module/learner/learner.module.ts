import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearnerState, LearnerStateSchema } from './learner-state.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LearnerState.name,
        schema: LearnerStateSchema,
        collection: 'learner_states',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class LearnerModule {}
