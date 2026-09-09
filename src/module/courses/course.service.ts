import { Injectable } from '@nestjs/common';
import { CourseRepository } from './course.repository.js';
import { CreateCoursePayload, COURSE_STATUS } from './course.dto.js';
import { ApiError } from '../../common/exceptions/api-error.exception.js';
import { Types } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: CourseRepository) {}

  /**
   * Creates a course shell for a newly-created learning goal.
   * Called internally by LearningGoalService — not exposed as a public endpoint.
   */
  async createForGoal(
    goalId: string,
    payload: CreateCoursePayload,
  ) {
    const existingCourse = await this.courseRepo.findOne({ goalId });
    if (existingCourse) {
      throw ApiError.conflict(
        `A course already exists for goal ${goalId}.`,
      );
    }

    const slug = await this.generateUniqueSlug(payload.title);

    const course = await this.courseRepo.create({
      goalId: new Types.ObjectId(goalId),
      title: payload.title,
      description: payload.description ?? null,
      slug,
      status: 'ACTIVE',
    });

    return course;
  }

  async findById(id: string) {
    const course = await this.courseRepo.findById(id);
    if (!course) {
      throw ApiError.notFound(`Course ${id} not found`);
    }
    return course;
  }

  async findByGoalId(goalId: string) {
    const course = await this.courseRepo.findOne({ goalId });
    if (!course) {
      throw ApiError.notFound(`Course for goal ${goalId} not found`);
    }
    return course;
  }

  async updateStatus(
    id: string,
    status: (typeof COURSE_STATUS)[number],
  ) {
    await this.ensureExists(id);

    // Completion should be driven by the learning agent, not set directly.
    if (status === 'COMPLETED') {
      throw ApiError.badRequest(
        'Courses cannot be marked COMPLETED directly — this must be driven by the learning agent.',
      );
    }

    const updated = await this.courseRepo.updateById(id, { status });
    if (!updated) {
      throw ApiError.notFound(`Course ${id} not found`);
    }
    return updated;
  }

  /**
   * Deletes a course. Prefer setting status to ARCHIVED over physical deletion.
   * The `force` flag must be explicitly true to proceed.
   */
  async delete(id: string, force: boolean = false) {
    await this.ensureExists(id);

    if (!force) {
      throw ApiError.badRequest(
        'Course deletion requires explicit force. Prefer setting status to ARCHIVED instead.',
      );
    }

    await this.courseRepo.deleteById(id);
    return { id, deleted: true };
  }

  async exists(filter: Record<string, unknown>) {
    return this.courseRepo.exists(filter);
  }

  private async ensureExists(id: string) {
    const found = await this.courseRepo.exists({ _id: id });
    if (!found) {
      throw ApiError.notFound(`Course ${id} not found`);
    }
  }

  private slugify(title: string): string {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = this.slugify(title);
    let candidate = base;
    let suffix = 1;

    while (await this.courseRepo.exists({ slug: candidate })) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    if (suffix > 1) {
      // Same or very similar title already exists as a distinct slug.
      // Worth flagging so a near-duplicate course doesn't sneak in unnoticed.
      throw ApiError.conflict(
        `A course with a title matching "${title}" may already exist (slug base: "${base}"). Verify before creating a near-duplicate.`,
      );
    }

    return candidate;
  }
}
