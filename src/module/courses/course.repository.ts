import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repository/base.repository.js';
import { Course } from './course.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CourseRepository extends BaseRepository<Course> {
  constructor(@InjectModel(Course.name) model: Model<Course>) {
    super(model);
  }
}
