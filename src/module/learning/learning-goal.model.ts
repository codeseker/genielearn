import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * LearningGoal collection — represents what a learner wants to achieve.
 *
 * The learning goal is the root entity for an adaptive learning experience.
 *
 * Design notes:
 * - userId must reference an existing user (from users collection).
 * - status values: ACTIVE, PAUSED, COMPLETED, ABANDONED.
 * - A goal cannot be marked COMPLETED unless the application determines
 *   the learning objective is complete.
 * - metadata must remain bounded and not replace domain fields.
 */
@Schema({
  timestamps: true,
  collection: "learning_goals",
})
export class LearningGoal {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Owner of the goal.
   * Required reference to users._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "UserProfile",
  })
  userId: Types.ObjectId;

  /**
   * Human-readable goal title.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  /**
   * Goal description / learner intent.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  description: string | null;

  /**
   * Goal lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED"],
    default: "ACTIVE",
  })
  status: string;

  /**
   * Initial/target difficulty when explicitly determined.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
  })
  targetDifficulty: number | null;

  /**
   * Bounded goal-specific metadata.
   * Must not be used as an unstructured replacement for domain fields.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type LearningGoalDocument = HydratedDocument<LearningGoal>;
export const LearningGoalSchema = SchemaFactory.createForClass(LearningGoal);
