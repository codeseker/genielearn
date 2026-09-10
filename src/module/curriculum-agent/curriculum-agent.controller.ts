import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GenerationJobService } from '../generation/service/generation-job.service.js';

@Controller('goals')
export class CurriculumAgentController {
  constructor(
    private readonly generationJobService: GenerationJobService,
  ) {}

  /**
   * Enqueue a curriculum analysis job for the given goal.
   * This now uses BullMQ for async processing instead of running synchronously.
   * The actual analysis happens in GenerationProcessor.
   */
  @Post(':goalId/curriculum-analysis')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueCurriculumAnalysis(
    @Param('goalId') goalId: string,
    @Body() body: { userId: string },
  ) {
    const result = await this.generationJobService.enqueueLearningAnalysis(
      body.userId,
      goalId,
    );

    return {
      jobRecordId: result.jobRecordId,
      status: result.status,
      generationKey: result.generationKey,
      message: 'Curriculum analysis queued for processing',
    };
  }
}
