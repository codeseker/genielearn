import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * LearningEvidence collection — append-only record of meaningful learner
 * signals used to update the learner model and drive adaptive decisions.
 *
 * Examples: quiz results, exercise attempts, AI answers, hints, lesson
 * completion, time spent, retries, skips, abandonment.
 *
 * Design notes:
 * - Evidence is append-only.
 * - Scores/metrics must be within [0, 1] when normalized.
 * - At least one meaningful contextual reference (lessonId, conceptId,
 *   assessmentId, or equivalent metadata) should be present for activity
 *   types that require context.
 * - Learning failures are learning signals, not infrastructure failures.
 * - Use createdAt as the authoritative event timestamp (append-only).
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "learning_evidence",
})
export class LearningEvidence {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Learner.
   * Required reference to users._id (UserProfile).
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "UserProfile",
  })
  userId: Types.ObjectId;

  /**
   * Learning goal.
   * Required reference to learning_goals._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "LearningGoal",
  })
  goalId: Types.ObjectId;

  /**
   * Related lesson.
   * Optional reference to lessons._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Lesson",
  })
  lessonId: Types.ObjectId | null;

  /**
   * Related concept.
   * Optional reference to concepts._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Concept",
  })
  conceptId: Types.ObjectId | null;

  /**
   * Related assessment.
   * Optional reference to assessments._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Assessment",
  })
  assessmentId: Types.ObjectId | null;

  /**
   * Related assessment attempt.
   * Optional reference to assessment_attempts._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "AssessmentAttempt",
  })
  assessmentAttemptId: Types.ObjectId | null;

  /**
   * Evidence/activity type.
   * Required.
   * Values:
   *   QUIZ_RESULT, EXERCISE_ATTEMPT, AI_ANSWER, HINT_REQUEST,
   *   LESSON_COMPLETION, TIME_SPENT, RETRY, SKIP, ABANDONMENT
   */
  @Prop({
    required: true,
    type: String,
    enum: [
      "QUIZ_RESULT",
      "EXERCISE_ATTEMPT",
      "AI_ANSWER",
      "HINT_REQUEST",
      "LESSON_COMPLETION",
      "TIME_SPENT",
      "RETRY",
      "SKIP",
      "ABANDONMENT",
    ],
  })
  activity: string;

  /**
   * Normalized score where applicable.
   * Optional, nullable. Must be in [0, 1] when present.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  score: number | null;

  /**
   * Correctness estimate.
   * Optional, nullable. Must be in [0, 1] when present.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  correctness: number | null;

  /**
   * Conceptual-depth estimate.
   * Optional, nullable. Must be in [0, 1] when present.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  depthScore: number | null;

  /**
   * Clarity estimate.
   * Optional, nullable. Must be in [0, 1] when present.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  clarityScore: number | null;

  /**
   * Confidence estimate.
   * Optional, nullable. Must be in [0, 1] when present.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  confidence: number | null;

  /**
   * Time spent in seconds.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  timeSpentSeconds: number | null;

  /**
   * Bounded evidence-specific data.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type LearningEvidenceDocument = HydratedDocument<LearningEvidence>;
export const LearningEvidenceSchema = SchemaFactory.createForClass(LearningEvidence);
