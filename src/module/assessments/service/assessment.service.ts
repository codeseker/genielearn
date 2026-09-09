import { Injectable } from '@nestjs/common';
import { AssessmentRepository } from '../repository/assessment.repository.js';
import { AssessmentAttemptRepository } from '../repository/assessment-attempt.repository.js';
import {
  CreateAssessmentPayload,
  SubmitAssessmentAttemptPayload,
} from '../dtos/assessment.dto.js';
import { ConceptService } from '../../concepts/services/concepts.service.js';
import { PrerequisiteService } from '../../concepts/services/prerequsite.service.js';
import { LearnerStateService } from '../../learner/service/learner-state.service.js';
import { ApiError } from '../../../common/exceptions/api-error.exception.js';
import { Types } from 'mongoose';
import { getStubQuestionsForConcept } from '../data/stub-questions.js';

interface QuestionDoc {
  questionId: string;
  conceptId: string;
  question: string;
  type: 'MCQ';
  options: string[];
  correctAnswer: string;
  difficulty: number;
  explanation: string;
}

/**
 * Strips correctAnswer and explanation from questions before
 * sending to the client. Answers must never be exposed via the API.
 */
function stripAnswers(questions: QuestionDoc[]) {
  return questions.map(({ correctAnswer: _c, explanation: _e, ...rest }) => rest);
}

@Injectable()
export class AssessmentService {
  constructor(
    private readonly assessmentRepo: AssessmentRepository,
    private readonly attemptRepo: AssessmentAttemptRepository,
    private readonly conceptService: ConceptService,
    private readonly prereqService: PrerequisiteService,
    private readonly learnerStateService: LearnerStateService,
  ) {}

  async create(
    userId: string,
    goalId: string,
    payload: CreateAssessmentPayload,
  ) {
    // 1. Validate targetConceptId exists (throws NotFoundException if missing).
    await this.conceptService.get(payload.targetConceptId);

    // 2. Get transitive prerequisites for the concept.
    const transitivePrereqs =
      await this.prereqService.getTransitivePrerequisites(payload.targetConceptId);
    const conceptIds = [payload.targetConceptId, ...transitivePrereqs];

    // 3. Pull questions from the stub bank for each concept.
    const allQuestions: QuestionDoc[] = [];
    for (const cid of conceptIds) {
      const conceptDoc = await this.conceptService.get(cid);
      const slug = conceptDoc.slug;
      const stubs = getStubQuestionsForConcept(slug);
      for (let i = 0; i < stubs.length; i++) {
        allQuestions.push({
          ...stubs[i],
          questionId: `${slug}-${i}`,
          conceptId: cid,
        });
      }
    }

    // 4. Create the assessment.
    const assessment = await this.assessmentRepo.create({
      userId: new Types.ObjectId(userId),
      goalId: new Types.ObjectId(goalId),
      lessonId: null,
      type: payload.type,
      status: 'ACTIVE',
      questions: allQuestions as unknown as Record<string, any>[],
      metadata: {
        targetConceptId: payload.targetConceptId,
        resolvedConceptIds: conceptIds,
      },
    });

    return {
      ...assessment,
      questions: stripAnswers(allQuestions),
    };
  }

  /**
   * @param forAttempt when true, strip answers (client-facing).
   * when false, return full document (internal use for grading).
   */
  async findById(id: string, forAttempt = false) {
    const assessment = await this.assessmentRepo.findById(id);
    if (!assessment) {
      throw ApiError.notFound(`Assessment ${id} not found`);
    }

    if (forAttempt) {
      return {
        ...assessment,
        questions: stripAnswers(
          assessment.questions as unknown as QuestionDoc[],
        ),
      };
    }

    return assessment;
  }

  async submitAttempt(
    assessmentId: string,
    userId: string,
    payload: SubmitAssessmentAttemptPayload,
  ) {
    // 1. Load assessment with full answers (internal lookup).
    const assessment = await this.findById(assessmentId, false);

    // 2. Validate assessment is ACTIVE.
    if (assessment.status !== 'ACTIVE') {
      throw ApiError.badRequest(
        `Assessment ${assessmentId} is not active (status: ${assessment.status}). Cannot submit.`,
      );
    }

    // 3. Grade each answer.
    const questions = assessment.questions as unknown as QuestionDoc[];
    const questionMap = new Map(questions.map((q) => [q.questionId, q]));

    let correctCount = 0;
    const perConcept: Record<
      string,
      { correct: number; total: number; mastery: number }
    > = {};

    for (const answer of payload.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const cid = question.conceptId;
      if (!perConcept[cid]) {
        perConcept[cid] = { correct: 0, total: 0, mastery: 0 };
      }
      perConcept[cid].total++;

      if (answer.selectedOption === question.correctAnswer) {
        correctCount++;
        perConcept[cid].correct++;
      }
    }

    // Compute mastery per concept.
    for (const cid of Object.keys(perConcept)) {
      const { correct, total } = perConcept[cid];
      perConcept[cid].mastery = total > 0 ? correct / total : 0;
    }

    const overallScore =
      payload.answers.length > 0
        ? correctCount / payload.answers.length
        : 0;

    // 4. Create the attempt document.
    const attempt = await this.attemptRepo.create({
      assessmentId: new Types.ObjectId(assessmentId),
      userId: new Types.ObjectId(userId),
      answers: payload.answers as unknown as Record<string, any>[],
      score: overallScore,
      status: 'EVALUATED',
      evaluation: { overallScore, perConcept },
      startedAt: null,
      submittedAt: new Date(),
    });

    // 5. Flip assessment status to COMPLETED.
    await this.assessmentRepo.updateById(assessmentId, {
      status: 'COMPLETED',
    });

    // 6. Update learner state (cross-module call).
    await this.learnerStateService.upsertFromAssessmentEvaluation(
      userId,
      assessment.goalId.toString(),
      { overallScore, perConcept },
    );

    return attempt;
  }

  async findAttemptById(attemptId: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw ApiError.notFound(`Assessment attempt ${attemptId} not found`);
    }
    return attempt;
  }
}
