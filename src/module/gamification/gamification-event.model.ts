import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * GamificationEvents collection — learning-outcome-driven gamification
 * events separately from the core learning engine.
 *
 * Design notes:
 * - Events are append-only.
 * - XP cannot be negative unless an explicit penalty mechanism is introduced
 *   and documented.
 * - Gamification must not be used as the source of truth for learner mastery.
 * - event values:
 *   LESSON_COMPLETED, QUIZ_PASSED, CONCEPT_MASTERED, EXERCISE_SOLVED,
 *   STREAK_MAINTAINED, MODULE_COMPLETED.
 * - Use createdAt as the authoritative event timestamp (append-only).
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "gamification_events",
})
export class GamificationEvent {
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
   * Related goal.
   * Optional reference to learning_goals._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "LearningGoal",
  })
  goalId: Types.ObjectId | null;

  /**
   * Gamification event type.
   * Required.
   * Values: LESSON_COMPLETED, QUIZ_PASSED, CONCEPT_MASTERED,
   * EXERCISE_SOLVED, STREAK_MAINTAINED, MODULE_COMPLETED.
   */
  @Prop({
    required: true,
    type: String,
    enum: [
      "LESSON_COMPLETED",
      "QUIZ_PASSED",
      "CONCEPT_MASTERED",
      "EXERCISE_SOLVED",
      "STREAK_MAINTAINED",
      "MODULE_COMPLETED",
    ],
  })
  type: string;

  /**
   * XP awarded.
   * Optional, defaults to 0. Cannot be negative unless penalty mechanism
   * is documented.
   */
  @Prop({
    required: false,
    default: 0,
  })
  xp: number;

  /**
   * Bounded event metadata.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type GamificationEventDocument = HydratedDocument<GamificationEvent>;
export const GamificationEventSchema = SchemaFactory.createForClass(GamificationEvent);
