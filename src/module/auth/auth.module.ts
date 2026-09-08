import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthDocument, AuthSchema } from './auth.model.js';
import { UsersModule } from '../users/users.module.js';

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
})
export class AuthModule {}
