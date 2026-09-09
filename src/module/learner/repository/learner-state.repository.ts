import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { LearnerState } from '../learner-state.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LearnerStateRepository extends BaseRepository<LearnerState> {
  constructor(@InjectModel(LearnerState.name) model: Model<LearnerState>) {
    super(model);
  }
}
