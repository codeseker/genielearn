import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * AgentRuns collection — audit trail for important AI-agent executions.
 *
 * An agent run records what happened during a bounded agent workflow,
 * including trigger, steps, model, prompt version, token usage, cost,
 * and final status.
 *
 * Design notes:
 * - runId must be unique (stable external/audit identifier).
 * - Agent execution is bounded by configured limits:
 *   MAX_AGENT_STEPS, MAX_RETRIES, MAX_LLM_CALLS, MAX_TOKENS, MAX_COST,
 *   MAX_EXECUTION_TIME.
 * - steps must remain bounded.
 * - status values: RUNNING, COMPLETED, FAILED, RETRYING, CANCELLED.
 * - Agent identifiers: learning-agent, content-agent, critic-agent,
 *   curriculum-agent (only registered agents accepted).
 */
@Schema({
  timestamps: true,
  collection: "agent_runs",
})
export class AgentRun {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Stable external/audit run identifier.
   * Required, unique, auto-generated.
   */
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  runId: string;

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
   * Goal being processed.
   * Required reference to learning_goals._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "LearningGoal",
  })
  goalId: Types.ObjectId;

  /**
   * Agent identifier.
   * Required.
   * Values: learning-agent, content-agent, critic-agent, curriculum-agent.
   */
  @Prop({
    required: true,
    trim: true,
  })
  agent: string;

  /**
   * Event/action that started the run.
   * Required.
   */
  @Prop({
    required: true,
    trim: true,
  })
  trigger: string;

  /**
   * Bounded state-machine/tool execution log.
   *
   * Step values: IDLE, OBSERVING, ANALYZING, DECIDING, EXECUTING,
   * EVALUATING, COMPLETED, FAILED, RETRYING.
   *
   * Must remain bounded to protect document size.
   */
  @Prop({
    required: true,
    type: [Object],
    default: () => [],
  })
  steps: Record<string, any>[];

  /**
   * LLM model used.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  model: string | null;

  /**
   * Prompt version used.
   * Optional reference to prompt_versions._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "PromptVersion",
  })
  promptVersionId: Types.ObjectId | null;

  /**
   * Input token count.
   * Optional, defaults to 0.
   */
  @Prop({
    required: false,
    default: 0,
  })
  inputTokens: number;

  /**
   * Output token count.
   * Optional, defaults to 0.
   */
  @Prop({
    required: false,
    default: 0,
  })
  outputTokens: number;

  /**
   * Estimated run cost.
   * Optional, defaults to 0.
   */
  @Prop({
    required: false,
    default: 0,
  })
  estimatedCost: number;

  /**
   * Run status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["RUNNING", "COMPLETED", "FAILED", "RETRYING", "CANCELLED"],
    default: "RUNNING",
  })
  status: string;

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
   * Run start time.
   * Required, defaults to current timestamp.
   */
  @Prop({
    required: true,
    default: () => new Date(),
  })
  startedAt: Date;

  /**
   * Run completion time.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
  })
  completedAt: Date | null;
}

export type AgentRunDocument = HydratedDocument<AgentRun>;
export const AgentRunSchema = SchemaFactory.createForClass(AgentRun);
