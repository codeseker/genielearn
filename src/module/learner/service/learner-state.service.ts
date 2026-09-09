import { Injectable } from '@nestjs/common';
import { LearnerStateRepository } from '../repository/learner-state.repository.js';
import { ApiError } from '../../../common/exceptions/api-error.exception.js';
import { Types } from 'mongoose';

export interface AssessmentEvaluation {
  overallScore: number;
  perConcept: Record<
    string,
    { correct: number; total: number; mastery: number }
  >;
}

@Injectable()
export class LearnerStateService {
  constructor(private readonly stateRepo: LearnerStateRepository) {}

  async findByUserAndGoal(userId: string, goalId: string) {
    const state = await this.stateRepo.findOne({
      userId: new Types.ObjectId(userId),
      goalId: new Types.ObjectId(goalId),
    });
    if (!state) {
      throw ApiError.notFound(
        `Learner state for user ${userId} / goal ${goalId} not found`,
      );
    }
    return state;
  }

  async upsertFromAssessmentEvaluation(
    userId: string,
    goalId: string,
    evaluation: AssessmentEvaluation,
  ) {
    const existing = await this.stateRepo.findOne({
      userId: new Types.ObjectId(userId),
      goalId: new Types.ObjectId(goalId),
    });

    // Build merged knowledge map — start from existing, then overlay new data.
    const knowledge: Record<
      string,
      { mastery: number; confidence: number }
    > = existing ? { ...existing.knowledge } : {};

    for (const [conceptId, { mastery }] of Object.entries(
      evaluation.perConcept,
    )) {
      knowledge[conceptId] = { mastery, confidence: mastery };
    }

    // Recompute derived fields from the merged knowledge map.
    const allMasteryValues = Object.values(knowledge).map((k) => k.mastery);
    const weakConcepts: Types.ObjectId[] = [];
    const strongConcepts: Types.ObjectId[] = [];

    for (const [conceptId, { mastery }] of Object.entries(knowledge)) {
      if (mastery < 0.5) weakConcepts.push(new Types.ObjectId(conceptId));
      if (mastery >= 0.8) strongConcepts.push(new Types.ObjectId(conceptId));
    }

    const overallMastery =
      allMasteryValues.length > 0
        ? allMasteryValues.reduce((a, b) => a + b, 0) /
          allMasteryValues.length
        : null;

    if (existing) {
      const updated = await this.stateRepo.updateById(existing._id, {
        knowledge,
        weakConcepts,
        strongConcepts,
        overallMastery,
        version: existing.version + 1,
      });
      if (!updated) {
        throw ApiError.internal(
          `Failed to update learner state for user ${userId} / goal ${goalId}`,
        );
      }
      return updated;
    }

    return this.stateRepo.create({
      userId: new Types.ObjectId(userId),
      goalId: new Types.ObjectId(goalId),
      knowledge,
      weakConcepts,
      strongConcepts,
      currentConceptId: null,
      currentLessonId: null,
      difficulty: 1,
      engagement: null,
      learningVelocity: null,
      overallMastery,
      version: 1,
    });
  }
}
