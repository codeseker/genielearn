import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/repository/base.repository.js';
import { PromptVersion, PromptVersionDocument, PromptVersionAgent, PromptVersionStatus } from '../schema/prompt-version.model.js';

@Injectable()
export class PromptVersionRepository extends BaseRepository<PromptVersion> {
  constructor(
    @InjectModel(PromptVersion.name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    promptVersionModel: any,
  ) {
    super(promptVersionModel);
  }

  async findHighestVersion(promptId: string): Promise<number> {
    const doc = await this.model
      .findOne({ promptId })
      .sort({ version: -1 })
      .lean()
      .exec();

    if (!doc) {
      return 0;
    }

    return (doc as { version: number }).version;
  }

  async findActiveByPromptIdAndAgent(
    promptId: string,
    agent: PromptVersionAgent,
  ): Promise<PromptVersionDocument | null> {
    return this.model.findOne({
      promptId,
      status: 'ACTIVE' as PromptVersionStatus,
      agent,
    }).exec();
  }

  async findActiveByPromptId(promptId: string): Promise<PromptVersionDocument | null> {
    return this.model.findOne({
      promptId,
      status: 'ACTIVE' as PromptVersionStatus,
    }).exec();
  }

  async findByPromptIdSortedDesc(promptId: string): Promise<PromptVersionDocument[]> {
    return this.model
      .find({ promptId })
      .sort({ version: -1, createdAt: -1 })
      .exec();
  }
}
