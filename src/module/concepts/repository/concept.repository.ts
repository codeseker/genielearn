import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { Concept } from '../concept.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConceptRepository extends BaseRepository<Concept> {
  constructor(@InjectModel(Concept.name) conceptModel: Model<Concept>) {
    super(conceptModel);
  }
}
