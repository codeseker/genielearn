import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationEvent, GamificationEventSchema } from './gamification-event.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GamificationEvent.name,
        schema: GamificationEventSchema,
        collection: 'gamification_events',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class GamificationModule {}
