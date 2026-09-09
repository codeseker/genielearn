import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { LearningGoal } from '../learning-goal.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LearningGoalRepository extends BaseRepository<LearningGoal> {
  constructor(@InjectModel(LearningGoal.name) model: Model<LearningGoal>) {
    super(model);
  }
}
