import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { GenerationJobService } from './service/generation-job.service.js';
import { CurriculumAgentService } from '../curriculum-agent/service/curriculum-agent.service.js';

export interface CurriculumAnalysisJobPayload {
  jobRecordId: string;
  goalId: string;
  userId: string;
}

@Processor('generation')
@Injectable()
export class GenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(
    private readonly generationJobService: GenerationJobService,
    private readonly curriculumAgentService: CurriculumAgentService,
  ) {
    super();
  }

  async process(job: Job<CurriculumAnalysisJobPayload>): Promise<void> {
    const { jobRecordId, goalId } = job.data;

    this.logger.log(`Processing job ${jobRecordId} for goal ${goalId}`);

    // Load and update job status to PROCESSING
    const jobRecord = await this.generationJobService.updateJobStatus(
      jobRecordId,
      'PROCESSING',
    );

    if (!jobRecord) {
      this.logger.error(`Job record ${jobRecordId} not found`);
      throw new Error(`Job record ${jobRecordId} not found`);
    }

    try {
      // Execute the curriculum analysis
      await this.curriculumAgentService.analyzeGoal(goalId);

      // Update to COMPLETED
      await this.generationJobService.updateJobStatus(jobRecordId, 'COMPLETED');
      this.logger.log(`Job ${jobRecordId} completed successfully`);
    } catch (error) {
      this.logger.error(`Job ${jobRecordId} failed: ${error instanceof Error ? error.message : String(error)}`);

      // Increment attempts and handle retry/dead letter
      const updatedJob = await this.generationJobService.incrementAttempts(jobRecordId);

      if (updatedJob && updatedJob.status === 'RETRYING') {
        this.logger.log(`Job ${jobRecordId} will retry (attempt ${updatedJob.attempts}/${updatedJob.maxAttempts})`);
        throw error; // Re-throw to let BullMQ handle the retry
      }

      // Mark as FAILED if max attempts exceeded
      await this.generationJobService.updateJobStatus(
        jobRecordId,
        'FAILED',
        {
          message: error instanceof Error ? error.message : String(error),
          attempts: updatedJob?.attempts,
        },
      );

      this.logger.error(`Job ${jobRecordId} marked as FAILED`);
      throw error;
    }
  }
}
