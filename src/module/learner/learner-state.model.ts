import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * LearnerStates collection — compact, current learner model used by the
 * adaptive Learning Agent.
 *
 * learner_states is a SNAPSHOT, not an activity log.
 *
 * Design notes:
 * - (userId, goalId) must be unique — one state per learner/goal pair.
 * - mastery, confidence, engagement, overallMastery must be normalized
 *   to [0, 1] when present.
 * - difficulty must remain within the supported difficulty range.
 * - weakConcepts and strongConcepts should not contain duplicate concept IDs.
 * - Learner state is derived from evidence; evidence must not be discarded
 *   merely because a snapshot exists.
 */
@Schema({
  timestamps: true,
  collection: "learner_states",
})
export class LearnerState {
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
   * Required, unique reference to learning_goals._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "LearningGoal",
  })
  goalId: Types.ObjectId;

  /**
   * Concept-keyed mastery/confidence state.
   *
   * Structure:
   * {
   *   "<conceptId>": {
   *     mastery: 0.72,
   *     confidence: 0.67
   *   }
   * }
   *
   * The application should use stable concept references.
   */
  @Prop({
    required: true,
    type: Object,
    default: () => ({}),
  })
  knowledge: Record<string, { mastery: number; confidence: number }>;

  /**
   * Concepts currently identified as weak.
   * References to concepts._id.
   */
  @Prop({
    required: true,
    type: [Types.ObjectId],
    ref: "Concept",
    default: () => [],
  })
  weakConcepts: Types.ObjectId[];

  /**
   * Concepts currently identified as strong.
   * References to concepts._id.
   */
  @Prop({
    required: true,
    type: [Types.ObjectId],
    ref: "Concept",
    default: () => [],
  })
  strongConcepts: Types.ObjectId[];

  /**
   * Current concept.
   * Optional reference to concepts._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Concept",
  })
  currentConceptId: Types.ObjectId | null;

  /**
   * Current lesson.
   * Optional reference to lessons._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "Lesson",
  })
  currentLessonId: Types.ObjectId | null;

  /**
   * Current adaptive difficulty.
   * Required, defaults to 1.
   */
  @Prop({
    required: true,
    default: 1,
  })
  difficulty: number;

  /**
   * Current engagement estimate.
   * Optional, nullable. Must be in [0, 1] when present.
   */
  @Prop({
    required: false,
    default: null,
  })
  engagement: number | null;

  /**
   * Estimated learning velocity.
   * Optional, nullable.
   * Values: SLOW, MEDIUM, FAST.
   */
  @Prop({
    required: false,
    default: null,
    type: String,
    enum: ["SLOW", "MEDIUM", "FAST"],
  })
  learningVelocity: string | null;

  /**
   * Aggregate mastery estimate.
   * Optional, nullable. Must be in [0, 1] when present.
   */
  @Prop({
    required: false,
    default: null,
  })
  overallMastery: number | null;

  /**
   * Snapshot version used for optimistic/concurrency control.
   * Required, defaults to 1.
   */
  @Prop({
    required: true,
    default: 1,
  })
  version: number;
}

export type LearnerStateDocument = HydratedDocument<LearnerState>;
export const LearnerStateSchema = SchemaFactory.createForClass(LearnerState);
