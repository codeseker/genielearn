import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * LLMUsage collection — tracks every significant LLM call for cost,
 * performance, and operational analysis.
 *
 * The system should be able to answer:
 * - How much did this learner's course cost?
 * - Which agent consumed the most tokens?
 * - Which prompt version is cheaper?
 *
 * Design notes:
 * - Token counts cannot be negative.
 * - Cost cannot be negative.
 * - Historical usage records should be append-only.
 * - Usage records should retain provider/model/prompt information needed
 *   for later analysis.
 * - Use createdAt as the authoritative call timestamp (append-only).
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "llm_usage",
})
export class LLMUsage {
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
   * Agent run.
   * Optional reference to agent_runs._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "AgentRun",
  })
  agentRunId: Types.ObjectId | null;

  /**
   * Job.
   * Optional reference to generation_jobs._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "GenerationJob",
  })
  jobId: Types.ObjectId | null;

  /**
   * Lesson.
   * Optional reference to lessons._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Lesson",
  })
  lessonId: Types.ObjectId | null;

  /**
   * Agent responsible.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  agent: string;

  /**
   * LLM provider.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  provider: string;

  /**
   * Model identifier.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  model: string;

  /**
   * Prompt version.
   * Optional reference to prompt_versions._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "PromptVersion",
  })
  promptVersionId: Types.ObjectId | null;

  /**
   * Input tokens.
   * Required, defaults to 0. Cannot be negative.
   */
  @Prop({
    required: true,
    default: 0,
  })
  inputTokens: number;

  /**
   * Output tokens.
   * Required, defaults to 0. Cannot be negative.
   */
  @Prop({
    required: true,
    default: 0,
  })
  outputTokens: number;

  /**
   * LLM latency in milliseconds.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
  })
  latencyMs: number | null;

  /**
   * Estimated monetary cost.
   * Required, defaults to 0. Cannot be negative.
   */
  @Prop({
    required: true,
    default: 0,
  })
  estimatedCost: number;

  /**
   * Whether call succeeded.
   * Required.
   */
  @Prop({
    required: true,
  })
  success: boolean;

  /**
   * Structured error.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    type: Object,
  })
  error: Record<string, any> | null;
}

export type LLMUsageDocument = HydratedDocument<LLMUsage>;
export const LLMUsageSchema = SchemaFactory.createForClass(LLMUsage);
