import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningGoal, LearningGoalSchema } from './learning-goal.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LearningGoal.name,
        schema: LearningGoalSchema,
        collection: 'learning_goals',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class LearningModule {}
