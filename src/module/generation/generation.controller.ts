import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GenerationJobService } from './service/generation-job.service.js';
import { CurriculumAgentService } from '../curriculum-agent/service/curriculum-agent.service.js';

@Controller('generation-jobs')
export class GenerationController {
  constructor(
    private readonly generationJobService: GenerationJobService,
    private readonly curriculumAgentService: CurriculumAgentService,
  ) {}

  @Post('learning-analysis')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueLearningAnalysis(
    @Body() body: { userId: string; goalId: string },
  ) {
    const result = await this.generationJobService.enqueueLearningAnalysis(
      body.userId,
      body.goalId,
    );

    return {
      jobRecordId: result.jobRecordId,
      status: result.status,
      generationKey: result.generationKey,
      message: 'Curriculum analysis queued for processing',
    };
  }

  @Get(':id')
  async getJobStatus(@Param('id') id: string) {
    const job = await this.generationJobService.getJobById(id);

    if (!job) {
      return { error: 'Job not found' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = job as any;
    return {
      _id: j._id,
      generationKey: j.generationKey,
      userId: j.userId,
      goalId: j.goalId,
      type: j.type,
      status: j.status,
      attempts: j.attempts,
      maxAttempts: j.maxAttempts,
      error: j.error,
      startedAt: j.startedAt,
      completedAt: j.completedAt,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
    };
  }
}
