import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModule, CourseModuleSchema } from './course-module.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CourseModule.name,
        schema: CourseModuleSchema,
        collection: 'modules',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class ModulesModule {}
