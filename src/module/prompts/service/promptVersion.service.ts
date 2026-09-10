import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromptVersion, PromptVersionDocument } from '../prompt-version.model.js';
import { Agents } from '../../llm/service/llm.service.js';

@Injectable()
export class PromptVersionService {
  constructor(
    @InjectModel(PromptVersion.name)
    private readonly promptVersionModel: Model<PromptVersionDocument>,
  ) {}

  async create(payload: {
    promptId: string;
    agent: Agents;
    systemPrompt: string;
    outputSchema: Record<string, unknown>;
    model?: string | null;
    configuration?: Record<string, unknown>;
  }): Promise<PromptVersionDocument> {
    const validAgents: Agents[] = [
      'curriculum-agent',
      'content-agent',
      'critic-agent',
      'learning-agent',
    ];
    if (!validAgents.includes(payload.agent)) {
      throw new BadRequestException(
        `Invalid agent "${payload.agent}". Must be one of: ${validAgents.join(', ')}`,
      );
    }

    const highestVersionDoc = await this.promptVersionModel
      .findOne({ promptId: payload.promptId })
      .sort({ version: -1 })
      .lean()
      .exec();

    const nextVersion = (highestVersionDoc?.version ?? 0) + 1;

    const doc = await this.promptVersionModel.create(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {
        promptId: payload.promptId,
        version: nextVersion,
        agent: payload.agent,
        systemPrompt: payload.systemPrompt,
        outputSchema: payload.outputSchema,
        model: payload.model ?? null,
        configuration: payload.configuration ?? {},
        status: 'DRAFT',
      } as any
    );

    return doc as PromptVersionDocument;
  }

  async activate(id: string): Promise<PromptVersionDocument> {
    const target = await this.findById(id);

    const otherActive = await this.promptVersionModel
      .findOne({
        promptId: target.promptId,
        status: 'ACTIVE',
        _id: { $ne: target._id },
      })
      .exec();

    if (otherActive) {
      await this.promptVersionModel.updateOne(
        { _id: otherActive._id },
        { status: 'DEPRECATED' },
      );
    }

    const updated = await this.promptVersionModel.findByIdAndUpdate(
      id,
      { status: 'ACTIVE' },
      { returnDocument: 'after' },
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Prompt version ${id} not found`);
    }

    return updated as PromptVersionDocument;
  }

  async getActiveVersion(
    promptId: string,
    agent: Agents,
  ): Promise<PromptVersionDocument> {
    const doc = await this.promptVersionModel
      .findOne({
        promptId,
        status: 'ACTIVE',
      })
      .exec();

    if (!doc) {
      throw new NotFoundException(
        `No ACTIVE prompt version found for promptId "${promptId}" and agent "${agent}"`,
      );
    }

    if (doc.agent !== agent) {
      throw new BadRequestException(
        `Prompt version for "${promptId}" is registered for agent "${doc.agent}" but was requested for agent "${agent}"`,
      );
    }

    return doc as PromptVersionDocument;
  }

  async findById(id: string): Promise<PromptVersionDocument> {
    const doc = await this.promptVersionModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`Prompt version ${id} not found`);
    }
    return doc as PromptVersionDocument;
  }

  async listVersions(promptId: string): Promise<PromptVersionDocument[]> {
    const docs = await this.promptVersionModel
      .find({ promptId })
      .sort({ version: -1, createdAt: -1 })
      .exec();

    return docs as PromptVersionDocument[];
  }
}
