import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '../../../config/config.service.js';
import { Queue } from 'bullmq';
import { GenerationJob, GenerationJobDocument, GenerationJobStatus } from '../schema/generation-job.model.js';
import { Types } from 'mongoose';

interface CreateJobPayload {
  userId: string;
  goalId: string;
  type: string;
  maxAttempts?: number;
}

interface EnqueueResult {
  jobRecordId: string;
  status: string;
  generationKey: string;
}

@Injectable()
export class GenerationJobService {
  private readonly logger = new Logger(GenerationJobService.name);
  private generationQueue?: Queue;

  constructor(
    @InjectModel(GenerationJob.name)
    private readonly generationJobModel: Model<GenerationJobDocument>,
    private readonly configService: ConfigService,
  ) {}

  setGenerationQueue(queue: Queue): void {
    this.generationQueue = queue;
  }

  async enqueueLearningAnalysis(
    userId: string,
    goalId: string,
  ): Promise<EnqueueResult> {
    const generationKey = `${goalId}-LEARNING_ANALYSIS`;

    // Check for existing job
    const existingJob = await this.generationJobModel
      .findOne({ generationKey })
      .exec();

    if (existingJob) {
      // Idempotency: if already PENDING, PROCESSING, or COMPLETED, return existing
      if (
        existingJob.status === 'PENDING' ||
        existingJob.status === 'PROCESSING' ||
        existingJob.status === 'COMPLETED'
      ) {
        this.logger.log(
          `Job ${generationKey} already ${existingJob.status}, returning existing`,
        );
        return {
          jobRecordId: existingJob._id.toString(),
          status: existingJob.status,
          generationKey,
        };
      }

      // If FAILED, allow re-enqueueing
      if (existingJob.status === 'FAILED') {
        await this.generationJobModel.updateOne(
          { _id: existingJob._id },
          {
            status: 'PENDING',
            attempts: 0,
            error: null,
          },
        );
      }
    } else {
      // Create new job record
      const newJob = await this.generationJobModel.create({
        generationKey,
        userId: new Types.ObjectId(userId),
        goalId: new Types.ObjectId(goalId),
        type: 'LEARNING_ANALYSIS',
        status: 'PENDING',
        attempts: 0,
        maxAttempts: 3,
      });

      this.logger.log(`Created new generation job: ${newJob._id}`);
    }

    // Enqueue to BullMQ
    if (this.generationQueue) {
      await this.generationQueue.add('curriculum-analysis', {
        jobRecordId: (await this.generationJobModel.findOne({ generationKey }).exec())!._id.toString(),
        goalId,
        userId,
      });
    } else {
      this.logger.warn('Generation queue not set, job not enqueued');
    }

    const jobRecord = await this.generationJobModel
      .findOne({ generationKey })
      .exec();

    return {
      jobRecordId: jobRecord!._id.toString(),
      status: jobRecord!.status,
      generationKey,
    };
  }

  async getJobById(id: string): Promise<GenerationJobDocument | null> {
    return this.generationJobModel.findById(id).exec();
  }

  async updateJobStatus(
    id: string,
    status: GenerationJobStatus,
    error?: Record<string, unknown> | null,
  ): Promise<GenerationJobDocument | null> {
    const updateData: Record<string, unknown> = { status };

    if (status === 'PROCESSING') {
      updateData.startedAt = new Date();
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    if (error) {
      updateData.error = error;
    }

    return this.generationJobModel
      .findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
      .exec();
  }

  async incrementAttempts(id: string): Promise<GenerationJobDocument | null> {
    const job = await this.generationJobModel.findById(id).exec();
    if (!job) return null;

    const newAttempts = job.attempts + 1;
    const shouldRetry = newAttempts < job.maxAttempts;

    const status: GenerationJobStatus = shouldRetry ? 'RETRYING' : 'FAILED';

    return this.generationJobModel
      .findByIdAndUpdate(id, {
        attempts: newAttempts,
        status,
        error: shouldRetry ? undefined : { message: 'Max attempts exceeded' },
      }, { returnDocument: 'after' })
      .exec();
  }
}
