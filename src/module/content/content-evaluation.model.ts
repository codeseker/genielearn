import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * ContentEvaluations collection — quality evaluations of generated content
 * performed by the critic/evaluation workflow.
 *
 * Design notes:
 * - All normalized scores must use the same score range [0, 1].
 * - revisionNumber <= 3 under the established maximum revision policy.
 * - An evaluation must reference an existing content version.
 * - Publication requires an acceptable evaluation result.
 * - recommendation values: PUBLISH, REVISE, REJECT.
 * - Use createdAt as the authoritative event timestamp (append-only).
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "content_evaluations",
})
export class ContentEvaluation {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Content being evaluated.
   * Required reference to content_versions._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "ContentVersion",
  })
  contentVersionId: Types.ObjectId;

  /**
   * Lesson.
   * Required reference to lessons._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "Lesson",
  })
  lessonId: Types.ObjectId;

  /**
   * Generation job.
   * Optional reference to generation_jobs._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "GenerationJob",
  })
  generationJobId: Types.ObjectId | null;

  /**
   * Evaluation agent run.
   * Optional reference to agent_runs._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "AgentRun",
  })
  agentRunId: Types.ObjectId | null;

  /**
   * Overall quality score.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  overallScore: number;

  /**
   * Factual correctness.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  factualCorrectness: number;

  /**
   * Learning-objective alignment.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  objectiveAlignment: number;

  /**
   * Difficulty appropriateness.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  difficulty: number;

  /**
   * Completeness.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  completeness: number;

  /**
   * Clarity.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  clarity: number;

  /**
   * Prerequisite consistency.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  prerequisiteConsistency: number;

  /**
   * Example quality.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  exampleQuality: number;

  /**
   * Exercise quality.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  exerciseQuality: number;

  /**
   * Duplicate-content assessment.
   * Required, must be in [0, 1].
   */
  @Prop({
    required: true,
  })
  duplicateContent: number;

  /**
   * Identified issues.
   * Required, array of strings.
   */
  @Prop({
    required: true,
    type: [String],
    default: () => [],
  })
  issues: string[];

  /**
   * Evaluation outcome.
   * Required.
   * Values: PUBLISH, REVISE, REJECT.
   */
  @Prop({
    required: true,
    trim: true,
  })
  recommendation: string;

  /**
   * Revision iteration.
   * Required, defaults to 0. Must be <= 3.
   */
  @Prop({
    required: true,
    default: 0,
  })
  revisionNumber: number;
}

export type ContentEvaluationDocument = HydratedDocument<ContentEvaluation>;
export const ContentEvaluationSchema = SchemaFactory.createForClass(ContentEvaluation);
