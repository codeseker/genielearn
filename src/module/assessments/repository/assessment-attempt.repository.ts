import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { AssessmentAttempt } from '../assessment-attempt.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AssessmentAttemptRepository extends BaseRepository<AssessmentAttempt> {
  constructor(
    @InjectModel(AssessmentAttempt.name)
    model: Model<AssessmentAttempt>,
  ) {
    super(model);
  }
}
