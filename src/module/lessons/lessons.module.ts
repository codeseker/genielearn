import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './lesson.model.js';
import { ContentVersion, ContentVersionSchema } from './content-version.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Lesson.name,
        schema: LessonSchema,
        collection: 'lessons',
      },
      {
        name: ContentVersion.name,
        schema: ContentVersionSchema,
        collection: 'content_versions',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class LessonsModule {}
