import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './auth.model.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Auth.name,
        schema: AuthSchema,
        collection: 'auths',
      },
    ]),
    UsersModule,
  ],
  exports: [MongooseModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
