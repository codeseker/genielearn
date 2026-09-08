import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * AssessmentAttempts collection — learner's submitted answers and the
 * resulting assessment attempt.
 *
 * Design notes:
 * - assessmentId must reference an existing assessment.
 * - userId must reference the learner.
 * - Scores must be normalized when represented as normalized scores.
 * - An attempt should not be modified after reaching its final immutable
 *   state except for explicitly permitted evaluation metadata.
 * - status values: IN_PROGRESS, SUBMITTED, EVALUATING, EVALUATED, FAILED.
 */
@Schema({
  timestamps: true,
  collection: "assessment_attempts",
})
export class AssessmentAttempt {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Assessment being attempted.
   * Required reference to assessments._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "Assessment",
  })
  assessmentId: Types.ObjectId;

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
   * Submitted answers.
   *
   * Structured answer data owned by the attempt.
   */
  @Prop({
    required: true,
    type: [Object],
    default: () => [],
  })
  answers: Record<string, any>[];

  /**
   * Normalized overall score.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  score: number | null;

  /**
   * Attempt lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["IN_PROGRESS", "SUBMITTED", "EVALUATING", "EVALUATED", "FAILED"],
    default: "SUBMITTED",
  })
  status: string;

  /**
   * Structured evaluation result.
   *
   * For AI-evaluated conceptual answers, evaluation may include:
   * {
   *   correctness: 0.86,
   *   depth: 0.61,
   *   clarity: 0.79,
   *   missingConcepts: []
   * }
   */
  @Prop({
    required: false,
    default: null,
    type: Object,
  })
  evaluation: Record<string, any> | null;

  /**
   * Attempt start time.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    type: Date,
    default: null,
  })
  startedAt: Date | null;

  /**
   * Submission time.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    type: Date,
    default: null,
  })
  submittedAt: Date | null;
}

export type AssessmentAttemptDocument = HydratedDocument<AssessmentAttempt>;
export const AssessmentAttemptSchema = SchemaFactory.createForClass(AssessmentAttempt);
