import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * GenerationJobs collection — durable persistence for asynchronous
 * generation/evaluation work.
 *
 * RabbitMQ transports jobs, while MongoDB persists job state and provides
 * correctness/idempotency guarantees.
 *
 * Design notes:
 * - generationKey must be unique (idempotency key).
 * - Database uniqueness is the final correctness mechanism for duplicate
 *   generation. Redis locks may reduce duplicate work but must not replace
 *   the database uniqueness constraint.
 * - attempts <= maxAttempts.
 * - Failed jobs must distinguish retryable infrastructure failures from
 *   non-retryable invalid requests.
 * - type values:
 *   LEARNING_ANALYSIS, CONTENT_GENERATION, CONTENT_EVALUATION,
 *   ASSESSMENT_GENERATION, ASSESSMENT_EVALUATION.
 * - status values:
 *   PENDING, PROCESSING, COMPLETED, FAILED, RETRYING, DEAD_LETTERED,
 *   CANCELLED.
 *
 * Idempotency key format:
 *   goalId + conceptId + generationVersion
 * (exact serialization is implementation-defined)
 */
@Schema({
  timestamps: true,
  collection: "generation_jobs",
})
export class GenerationJob {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Idempotency key.
   * Required, unique, auto-generated.
   *
   * Uniquely identifies a logically identical generation request.
   */
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  generationKey: string;

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
   * Goal.
   * Required reference to learning_goals._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "LearningGoal",
  })
  goalId: Types.ObjectId;

  /**
   * Generation/evaluation job type.
   * Required.
   * Values: LEARNING_ANALYSIS, CONTENT_GENERATION, CONTENT_EVALUATION,
   * ASSESSMENT_GENERATION, ASSESSMENT_EVALUATION.
   */
  @Prop({
    required: true,
    trim: true,
  })
  type: string;

  /**
   * Target concept.
   * Optional reference to concepts._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Concept",
  })
  conceptId: Types.ObjectId | null;

  /**
   * Target course.
   * Optional reference to courses._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Course",
  })
  courseId: Types.ObjectId | null;

  /**
   * Target module.
   * Optional reference to modules._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "CourseModule",
  })
  moduleId: Types.ObjectId | null;

  /**
   * Target lesson.
   * Optional reference to lessons._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Lesson",
  })
  lessonId: Types.ObjectId | null;

  /**
   * Job lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
      "RETRYING",
      "DEAD_LETTERED",
      "CANCELLED",
    ],
    default: "PENDING",
  })
  status: string;

  /**
   * Number of processing attempts.
   * Required, defaults to 0.
   */
  @Prop({
    required: true,
    default: 0,
  })
  attempts: number;

  /**
   * Maximum retries.
   * Required, configured limit.
   */
  @Prop({
    required: true,
  })
  maxAttempts: number;

  /**
   * Related agent run.
   * Optional reference to agent_runs._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "AgentRun",
  })
  agentRunId: Types.ObjectId | null;

  /**
   * Structured failure information.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    type: Object,
  })
  error: Record<string, any> | null;

  /**
   * Processing start time.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
  })
  startedAt: Date | null;

  /**
   * Completion time.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
  })
  completedAt: Date | null;
}

export type GenerationJobDocument = HydratedDocument<GenerationJob>;
export const GenerationJobSchema = SchemaFactory.createForClass(GenerationJob);
