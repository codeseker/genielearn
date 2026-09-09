import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prerequisite } from '../prerequisite.model.js';

@Injectable()
export class PreRequisiteRepository extends BaseRepository<Prerequisite> {
  constructor(@InjectModel(Prerequisite.name) prerequisiteModel: Model<Prerequisite>) {
    super(prerequisiteModel);
  }
}
