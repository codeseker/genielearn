import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './course.model.js';
import { CourseRepository } from './course.repository.js';
import { CourseService } from './course.service.js';
import { CourseController } from './course.controller.js';

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
  exports: [MongooseModule, CourseService],
  providers: [CourseRepository, CourseService],
  controllers: [CourseController],
})
export class CoursesModule {}
