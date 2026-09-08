import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfile, UserProfileDocument, UserProfileSchema } from './user-profile.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserProfile.name,
        schema: UserProfileSchema,
        collection: 'user_profiles',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class UsersModule {}
