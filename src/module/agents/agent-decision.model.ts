import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * AgentDecisions collection — explainable decisions made by the Learning
 * Agent.
 *
 * The LLM does not receive unrestricted database mutation access. Its
 * proposed action is validated by the backend before execution.
 *
 * Design notes:
 * - action must be one of the explicitly allowed actions.
 * - confidence must be normalized to [0, 1].
 * - targetConceptId/targetLessonId must belong to the relevant goal/course
 *   context when supplied.
 * - The backend must validate a decision before executing it.
 * - An invalid tool/action request must be rejected rather than executed.
 * - action values:
 *   ADVANCE, REVIEW, REMEDIATE, REINFORCE, INCREASE_DIFFICULTY,
 *   DECREASE_DIFFICULTY, GENERATE_ASSESSMENT, ASK_CONCEPTUAL_QUESTION,
 *   PAUSE_GENERATION, COMPLETE_GOAL
 */
@Schema({
  timestamps: true,
  collection: "agent_decisions",
})
export class AgentDecision {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Agent run that produced the decision.
   * Required reference to agent_runs._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "AgentRun",
  })
  runId: Types.ObjectId;

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
   * Bounded agent action.
   * Required.
   * Values: ADVANCE, REVIEW, REMEDIATE, REINFORCE, INCREASE_DIFFICULTY,
   * DECREASE_DIFFICULTY, GENERATE_ASSESSMENT, ASK_CONCEPTUAL_QUESTION,
   * PAUSE_GENERATION, COMPLETE_GOAL.
   */
  @Prop({
    required: true,
    trim: true,
  })
  action: string;

  /**
   * Concept targeted by decision.
   * Optional reference to concepts._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Concept",
  })
  targetConceptId: Types.ObjectId | null;

  /**
   * Lesson targeted by decision.
   * Optional reference to lessons._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Lesson",
  })
  targetLessonId: Types.ObjectId | null;

  /**
   * Human-readable decision reasons.
   * Required, array of strings.
   */
  @Prop({
    required: true,
    type: [String],
    default: () => [],
  })
  reason: string[];

  /**
   * Evidence supporting the decision.
   * Required, bounded array.
   */
  @Prop({
    required: true,
    type: [Object],
    default: () => [],
  })
  evidence: Record<string, any>[];

  /**
   * Decision confidence.
   * Required, must be normalized to [0, 1].
   */
  @Prop({
    required: true,
  })
  confidence: number;

  /**
   * Requested target difficulty.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  targetDifficulty: number | null;

  /**
   * Backend validation result.
   * Required, defaults to false.
   */
  @Prop({
    required: true,
    default: false,
  })
  validated: boolean;

  /**
   * Whether decision was executed.
   * Required, defaults to false.
   */
  @Prop({
    required: true,
    default: false,
  })
  executed: boolean;

  /**
   * Bounded execution result.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    type: Object,
  })
  executionResult: Record<string, any> | null;
}

export type AgentDecisionDocument = HydratedDocument<AgentDecision>;
export const AgentDecisionSchema = SchemaFactory.createForClass(AgentDecision);
