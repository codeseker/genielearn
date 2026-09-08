import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Concept, ConceptSchema } from './concept.model.js';
import { Prerequisite, PrerequisiteSchema } from './prerequisite.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Concept.name,
        schema: ConceptSchema,
        collection: 'concepts',
      },
      {
        name: Prerequisite.name,
        schema: PrerequisiteSchema,
        collection: 'prerequisites',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class ConceptsModule {}
