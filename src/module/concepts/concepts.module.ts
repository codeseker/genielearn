import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Concept, ConceptSchema } from './concept.model.js';
import { Prerequisite, PrerequisiteSchema } from './prerequisite.model.js';
import { ConceptService } from './services/concepts.service.js';
import { PrerequisiteService } from './services/prerequsite.service.js';
import { ConceptRepository } from './repository/concept.repository.js';
import { PreRequisiteRepository } from './repository/prerequisite.repository.js';

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
  exports: [MongooseModule, ConceptService, PrerequisiteService],
  providers: [
    ConceptService,
    PrerequisiteService,
    ConceptRepository,
    PreRequisiteRepository,
  ],
})
export class ConceptsModule {}
