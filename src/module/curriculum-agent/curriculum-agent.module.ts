import { Module } from '@nestjs/common';
import { CurriculumAgentService } from './service/curriculum-agent.service.js';
import { CurriculumAgentController } from './curriculum-agent.controller.js';
import { ConceptsModule } from '../concepts/concepts.module.js';
import { LearningModule } from '../learning/learning.module.js';
import { LlmModule } from '../llm/llm.module.js';

@Module({
  imports: [ConceptsModule, LearningModule, LlmModule],
  controllers: [CurriculumAgentController],
  providers: [CurriculumAgentService],
  exports: [CurriculumAgentService],
})
export class CurriculumAgentModule {}
