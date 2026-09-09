import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearnerState, LearnerStateSchema } from './learner-state.model.js';
import { LearnerStateRepository } from './repository/learner-state.repository.js';
import { LearnerStateService } from './service/learner-state.service.js';
import { LearnerStateController } from './learner-state.controller.js';

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
  exports: [MongooseModule, LearnerStateService],
  providers: [LearnerStateRepository, LearnerStateService],
  controllers: [LearnerStateController],
})
export class LearnerModule {}
