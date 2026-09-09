import { Injectable } from '@nestjs/common';
import { LearningGoalRepository } from '../repository/learning-goal.repository.js';
import { CreateGoalPayload, GOAL_STATUS } from '../dto/goal.dtos.js';
import { Types } from 'mongoose';
import { ApiError } from '../../../common/exceptions/api-error.exception.js';
import { CourseService } from '../../courses/course.service.js';

@Injectable()
export class LearningGoalService {
  constructor(
    private readonly goalRepo: LearningGoalRepository,
    private readonly courseService: CourseService,
  ) {}

  async create(userId: Types.ObjectId, payload: CreateGoalPayload) {
    const goal = await this.goalRepo.create({
      ...payload,
      userId,
      status: 'ACTIVE',
    });

    // 1 goal -> 1 course, created as an empty shell right away.
    // Real modules/lessons get attached to this course later by the
    // generation pipeline, not here.
    const course = await this.courseService.createForGoal(goal._id.toString(), {
      title: payload.title,
    });

    // TODO: trigger a LEARNING_ANALYSIS generation_job here once the
    // generation + agents modules exist. For now this is a stub.

    return { goal, course };
  }

  async findById(id: string) {
    const goal = await this.goalRepo.findById(id);
    if (!goal) {
      throw ApiError.notFound(`Learning goal ${id} not found`);
    }
    return goal;
  }

  async findAllForUser(userId: string) {
    return this.goalRepo.findMany({ userId });
  }

  async updateStatus(id: string, status: (typeof GOAL_STATUS)[number]) {
    await this.ensureExists(id);

    // Per the schema doc: COMPLETED shouldn't be settable arbitrarily —
    // it should only happen once the application determines the
    // objective is actually complete. Flagging here rather than
    // silently allowing it.
    if (status === 'COMPLETED') {
      throw ApiError.badRequest(
        'Goals cannot be marked COMPLETED directly — this must be determined by the learning agent.',
      );
    }

    const updated = await this.goalRepo.updateById(id, { status });
    if (!updated) {
      throw ApiError.notFound(`Learning goal ${id} not found`);
    }
    return updated;
  }

  private async ensureExists(id: string) {
    const found = await this.goalRepo.exists({ _id: id });
    if (!found) {
      throw ApiError.notFound(`Learning goal ${id} not found`);
    }
  }
}
