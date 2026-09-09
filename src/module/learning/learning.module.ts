import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningGoal, LearningGoalSchema } from './learning-goal.model.js';
import { LearningGoalRepository } from './repository/learning-goal.repository.js';
import { LearningGoalService } from './service/learning-goal.service.js';
import { LearningGoalController } from './learning-goal.controller.js';
import { CoursesModule } from '../courses/courses.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LearningGoal.name,
        schema: LearningGoalSchema,
        collection: 'learning_goals',
      },
    ]),
    CoursesModule,
  ],
  exports: [MongooseModule],
  providers: [LearningGoalRepository, LearningGoalService],
  controllers: [LearningGoalController],
})
export class LearningModule {}
