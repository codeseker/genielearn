import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { Auth } from '../entities/auth.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthRepository extends BaseRepository<Auth> {
  constructor(@InjectModel(Auth.name) authModel: Model<Auth>) {
    super(authModel);
  }
}
