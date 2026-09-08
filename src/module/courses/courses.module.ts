import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './course.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Course.name,
        schema: CourseSchema,
        collection: 'courses',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class CoursesModule {}
