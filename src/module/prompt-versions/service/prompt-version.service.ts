import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PromptVersionRepository } from '../repository/prompt-version.repository.js';
import {
  CreatePromptVersionPayload,
  UpdatePromptVersionPayload,
} from '../dto/prompt-version.dto.js';
import { PromptVersion, PromptVersionDocument, PromptVersionAgent } from '../schema/prompt-version.model.js';

const VALID_AGENTS = [
  'curriculum-agent',
  'content-agent',
  'critic-agent',
  'learning-agent',
] as const;

@Injectable()
export class PromptVersionService {
  constructor(private readonly promptVersionRepo: PromptVersionRepository) {}

  async create(
    payload: CreatePromptVersionPayload,
  ): Promise<PromptVersionDocument | null> {
    if (!VALID_AGENTS.includes(payload.agent)) {
      throw new BadRequestException(
        `Invalid agent "${payload.agent}". Must be one of: ${VALID_AGENTS.join(', ')}`,
      );
    }

    const highestVersion = await this.promptVersionRepo.findHighestVersion(
      payload.promptId,
    );
    const nextVersion = highestVersion + 1;

    const doc = await this.promptVersionRepo.create({
      promptId: payload.promptId,
      version: nextVersion,
      agent: payload.agent,
      systemPrompt: payload.systemPrompt,
      outputSchema: payload.outputSchema,
      model: payload.model ?? null,
      configuration: payload.configuration ?? {},
      status: 'DRAFT',
    });

    return doc as PromptVersionDocument;
  }

  async activate(id: string): Promise<PromptVersionDocument | null> {
    const target = await this.promptVersionRepo.findById(id);
    if (!target) {
      throw new NotFoundException(`Prompt version ${id} not found`);
    }

    // Demote any other active version for the same promptId
    const existingActive = await this.promptVersionRepo.findActiveByPromptId(
      target.promptId,
    );
    if (existingActive && existingActive._id.toString() !== id) {
      await this.promptVersionRepo.updateById(existingActive._id, {
        status: 'DEPRECATED',
      });
    }

    const updated = await this.promptVersionRepo.updateById(id, {
      status: 'ACTIVE',
    });

    if (!updated) {
      throw new NotFoundException(`Prompt version ${id} not found`);
    }

    return updated as PromptVersionDocument;
  }

  async getActiveVersion(
    promptId: string,
    agent: PromptVersionAgent,
  ): Promise<PromptVersionDocument | null> {
    const doc = await this.promptVersionRepo.findActiveByPromptIdAndAgent(
      promptId,
      agent,
    );

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

    return doc;
  }

  async findById(id: string): Promise<PromptVersionDocument | null> {
    const doc = await this.promptVersionRepo.findById(id);
    if (!doc) {
      throw new NotFoundException(`Prompt version ${id} not found`);
    }
    return doc as PromptVersionDocument;
  }

  async listVersions(promptId: string): Promise<PromptVersionDocument[]> {
    return this.promptVersionRepo.findByPromptIdSortedDesc(promptId) as Promise<PromptVersionDocument[]>;
  }

  async update(
    id: string,
    payload: UpdatePromptVersionPayload,
  ): Promise<PromptVersionDocument | null> {
    await this.findById(id);

    const updated = await this.promptVersionRepo.updateById(id, payload);
    if (!updated) {
      throw new NotFoundException(`Prompt version ${id} not found`);
    }
    return updated as PromptVersionDocument;
  }
}
