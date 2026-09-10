import { Injectable } from '@nestjs/common';
import { ConceptRepository } from '../repository/concept.repository.js';
import { Concept } from '../concept.model.js';
import {
  CreateConceptPayload,
  UpdateConceptPayload,
} from '../dtos/concept.dto.js';
import { ApiError } from '../../../common/exceptions/api-error.exception.js';

@Injectable()
export class ConceptService {
  constructor(private readonly conceptRepo: ConceptRepository) {}

  async create(conceptDTO: CreateConceptPayload) {
    const slug = await this.generateUniqueSlug(conceptDTO.name);

    const concept = await this.conceptRepo.create({
      ...conceptDTO,
      slug,
    });

    return {
      id: concept._id,
      name: concept.name,
      slug: concept.slug,
      description: concept.description,
    };
  }

  async get(id: string) {
    const concept = await this.conceptRepo.findById(id);
    if (!concept) {
      throw ApiError.notFound(`Concept not found`);
    }
    return concept;
  }

  async findBySlug(slug: string) {
    const concept = await this.conceptRepo.findOne({ slug });
    if (!concept) {
      throw ApiError.notFound(`Concept with slug "${slug}" not found`);
    }
    return concept;
  }

  /** Used by the curriculum agent to avoid creating duplicate concepts. */
  async findBySlugOrNull(slug: string) {
    return this.conceptRepo.findOne({ slug });
  }

  async update(id: string, updateDTO: UpdateConceptPayload) {
    await this.ensureExists(id);

    // Slug is derived from name and treated as a stable identifier —
    // we don't silently reslug on rename, since other documents may
    // already reference this concept by its original slug.
    const updated = await this.conceptRepo.updateById(id, updateDTO);
    if (!updated) {
      throw ApiError.notFound(`Concept ${id} not found`);
    }
    return updated;
  }

  async delete(id: string) {
    await this.ensureExists(id);

    await this.conceptRepo.deleteById(id);
    return { id, deleted: true };
  }

  async deleteMany(filter: Record<string, unknown>) {
    return this.conceptRepo.deleteMany(filter);
  }

  async exists(filter: Record<string, unknown>) {
    return this.conceptRepo.exists(filter);
  }

  async findMany(
    filter: Record<string, unknown> = {},
    options?: { limit?: number },
  ): Promise<Array<{ _id: string; name: string; slug: string }>> {
    const docs = await this.conceptRepo.findMany(filter);

    let result = docs.map((d) => ({
      _id: d._id.toString(),
      name: d.name,
      slug: d.slug,
    }));

    if (options?.limit && result.length > options.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  async resolveOrCreate(candidate: {
    name: string;
    description?: string | null;
    domain?: string | null;
    difficulty?: number | null;
  }): Promise<{ id: string; created: boolean }> {
    const baseSlug = this.slugify(candidate.name);
    let slug = baseSlug;
    let suffix = 1;

    // Find an unused slug, appending a numeric suffix silently if needed.
    // Unlike create(), this does NOT throw on near-duplicates — it's an
    // automated path that should always succeed.
    while (await this.conceptRepo.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const existing = await this.conceptRepo.findOne({ slug });
    if (existing) {
      return { id: existing._id.toString(), created: false };
    }

    const concept = await this.conceptRepo.create({
      name: candidate.name,
      slug,
      description: candidate.description ?? null,
      domain: candidate.domain ?? null,
      difficulty: candidate.difficulty ?? null,
    });

    return { id: concept._id.toString(), created: true };
  }

  private async ensureExists(id: string) {
    const found = await this.conceptRepo.exists({ _id: id });
    if (!found) {
      throw ApiError.notFound(`Concept ${id} not found`);
    }
  }

  private slugify(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);
    let candidate = base;
    let suffix = 1;

    while (await this.conceptRepo.exists({ slug: candidate })) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    if (suffix > 1) {
      // Same or very similar name already exists as a distinct slug.
      // Worth flagging so a near-duplicate concept doesn't sneak in unnoticed.
      throw ApiError.conflict(
        `A concept with a name matching "${name}" may already exist (slug base: "${base}"). Verify before creating a near-duplicate.`,
      );
    }

    return candidate;
  }
}
