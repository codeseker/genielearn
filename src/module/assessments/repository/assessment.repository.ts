import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { Assessment } from '../assessment.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AssessmentRepository extends BaseRepository<Assessment> {
  constructor(@InjectModel(Assessment.name) model: Model<Assessment>) {
    super(model);
  }
}
