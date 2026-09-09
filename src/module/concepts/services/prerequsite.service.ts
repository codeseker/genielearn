import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConceptService } from './concepts.service.js';
import { type CreatePrerequisitePayload } from '../dtos/prerequsite.dto.js';
import { PreRequisiteRepository } from '../repository/prerequisite.repository.js';
import { Types } from 'mongoose';
import { ApiError } from '../../../common/exceptions/api-error.exception.js';

@Injectable()
export class PrerequisiteService {
  constructor(
    private readonly prereqRepo: PreRequisiteRepository,
    private readonly conceptService: ConceptService,
  ) {}

  async create(payload: CreatePrerequisitePayload) {
    const { conceptId, prerequisiteConceptId } = payload;
    const conceptObjectId = this.toObjectId(conceptId);
    const prerequisiteObjectId = this.toObjectId(prerequisiteConceptId);

    // Both concepts must actually exist.
    const [conceptExists, prereqExists] = await Promise.all([
      this.conceptService.exists({ _id: conceptId }),
      this.conceptService.exists({ _id: prerequisiteConceptId }),
    ]);
    if (!conceptExists)
      throw new NotFoundException(`Concept ${conceptId} not found`);
    if (!prereqExists)
      throw new NotFoundException(`Concept ${prerequisiteConceptId} not found`);

    // Duplicate edge check.
    const edgeExists = await this.prereqRepo.exists({
      conceptId,
      prerequisiteConceptId,
    });
    if (edgeExists) {
      throw new ConflictException('This prerequisite edge already exists');
    }

    // Cycle check: does prerequisiteConceptId already transitively depend on conceptId?
    // If yes, adding conceptId -> prerequisiteConceptId would create a cycle.
    const wouldCycle = await this.dependsOn(prerequisiteConceptId, conceptId);
    if (wouldCycle) {
      throw new BadRequestException(
        `Adding this edge would create a cycle: "${prerequisiteConceptId}" already depends on "${conceptId}"`,
      );
    }

    return this.prereqRepo.create({
      conceptId: conceptObjectId,
      prerequisiteConceptId: prerequisiteObjectId,
      metadata: payload.metadata,
    });
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid concept ID: ${id}`);
    }

    return new Types.ObjectId(id);
  }

  /** BFS check: does `startConceptId` transitively depend on `targetConceptId`? */
  private async dependsOn(
    startConceptId: string,
    targetConceptId: string,
  ): Promise<boolean> {
    const visited = new Set<string>();
    let frontier = [startConceptId];

    while (frontier.length > 0) {
      const edges = await this.prereqRepo.findMany({
        conceptId: { $in: frontier },
      });
      const next: string[] = [];

      for (const edge of edges) {
        const prereqId = edge.prerequisiteConceptId.toString();
        if (prereqId === targetConceptId) return true;
        if (!visited.has(prereqId)) {
          visited.add(prereqId);
          next.push(prereqId);
        }
      }
      frontier = next;
    }
    return false;
  }

  /** Full transitive prerequisite set for a concept — this is what feeds the prerequisite assessment. */
  async getTransitivePrerequisites(conceptId: string): Promise<string[]> {
    const collected = new Set<string>();
    let frontier = [conceptId];

    while (frontier.length > 0) {
      const edges = await this.prereqRepo.findMany({
        conceptId: { $in: frontier },
      });
      const next: string[] = [];

      for (const edge of edges) {
        const prereqId = edge.prerequisiteConceptId.toString();
        if (!collected.has(prereqId)) {
          collected.add(prereqId);
          next.push(prereqId);
        }
      }
      frontier = next;
    }
    return Array.from(collected);
  }

  async deleteById(id: string) {
    return this.prereqRepo.deleteById(id);
  }
}
