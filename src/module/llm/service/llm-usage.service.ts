import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LLMUsage, LLMUsageDocument } from '../llm-usage.model.js';
import { Types } from 'mongoose';

interface LlmUsageRecordPayload {
  userId?: string | null;
  goalId?: string | null;
  jobId?: string | null;
  lessonId?: string | null;
  agent: string;
  provider: string;
  model: string;
  promptVersionId?: string | null;
  inputTokens: number;
  outputTokens: number;
  latencyMs?: number | null;
  estimatedCost: number;
  success: boolean;
  error?: Record<string, unknown> | null;
}

interface UsageBreakdown {
  agent: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  callCount: number;
}

@Injectable()
export class LlmUsageService {
  constructor(
    @InjectModel(LLMUsage.name)
    private readonly llmUsageModel: Model<LLMUsageDocument>,
  ) {}

  async record(payload: LlmUsageRecordPayload): Promise<LLMUsageDocument> {
    if (payload.inputTokens < 0) {
      throw new BadRequestException('inputTokens cannot be negative');
    }
    if (payload.outputTokens < 0) {
      throw new BadRequestException('outputTokens cannot be negative');
    }
    if (payload.estimatedCost < 0) {
      throw new BadRequestException('estimatedCost cannot be negative');
    }

    const doc = await this.llmUsageModel.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: (payload.userId ? new Types.ObjectId(payload.userId) : null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      goalId: (payload.goalId ? new Types.ObjectId(payload.goalId) : null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jobId: (payload.jobId ? new Types.ObjectId(payload.jobId) : null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lessonId: (payload.lessonId ? new Types.ObjectId(payload.lessonId) : null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      agent: payload.agent,
      provider: payload.provider,
      model: payload.model as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      promptVersionId: (payload.promptVersionId ? new Types.ObjectId(payload.promptVersionId) : null) as any,
      inputTokens: payload.inputTokens,
      outputTokens: payload.outputTokens,
      latencyMs: payload.latencyMs ?? null,
      estimatedCost: payload.estimatedCost,
      success: payload.success,
      error: payload.error ?? null,
    } as any);

    return doc;
  }

  async getTotalCostForGoal(goalId: string): Promise<number> {
    const result = await this.llmUsageModel
      .aggregate([
        {
          $match: {
            goalId: new Types.ObjectId(goalId),
          },
        },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$estimatedCost' },
          },
        },
      ])
      .exec();

    if (!result || result.length === 0) {
      return 0;
    }

    return (result[0].totalCost as number) ?? 0;
  }

  async getUsageBreakdownByAgent(
    goalId: string,
  ): Promise<UsageBreakdown[]> {
    const results = await this.llmUsageModel
      .aggregate([
        {
          $match: {
            goalId: new Types.ObjectId(goalId),
          },
        },
        {
          $group: {
            _id: '$agent',
            totalCost: { $sum: '$estimatedCost' },
            totalInputTokens: { $sum: '$inputTokens' },
            totalOutputTokens: { $sum: '$outputTokens' },
            callCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            totalCost: 1,
            totalInputTokens: 1,
            totalOutputTokens: 1,
            callCount: 1,
          },
        },
        {
          $sort: { totalCost: -1 },
        },
      ])
      .exec();

    return results as UsageBreakdown[];
  }
}
