import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Assessments collection — assessments used to determine prerequisite
 * knowledge, measure lesson/concept understanding, and support adaptive
 * learning.
 *
 * Design notes:
 * - goalId must reference the owning learning goal.
 * - userId must reference the learner.
 * - Assessment questions must pass schema/business validation before
 *   becoming active.
 * - Prerequisite assessments must be associated with the learner's goal.
 * - type values: PREREQUISITE, CONCEPT, LESSON, ADAPTIVE.
 * - status values: GENERATING, ACTIVE, COMPLETED, EXPIRED, CANCELLED.
 */
@Schema({
  timestamps: true,
  collection: "assessments",
})
export class Assessment {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Learner for the assessment.
   * Required reference to users._id (UserProfile).
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "UserProfile",
  })
  userId: Types.ObjectId;

  /**
   * Associated learning goal.
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
   * Assessment purpose.
   * Required.
   * Values: PREREQUISITE, CONCEPT, LESSON, ADAPTIVE.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["PREREQUISITE", "CONCEPT", "LESSON", "ADAPTIVE"],
  })
  type: string;

  /**
   * Assessment lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["GENERATING", "ACTIVE", "COMPLETED", "EXPIRED", "CANCELLED"],
    default: "ACTIVE",
  })
  status: string;

  /**
   * Structured assessment questions.
   *
   * Questions are structured application data, not arbitrary raw LLM text.
   * They may contain fields such as:
   *   question, type, options, correctAnswer/expectedAnswer,
   *   conceptId, difficulty, explanation
   *
   * The authoritative nested question schema is defined by the application
   * validation layer.
   */
  @Prop({
    required: true,
    type: [Object],
    default: () => [],
  })
  questions: Record<string, any>[];

  /**
   * Assessment configuration/context.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type AssessmentDocument = HydratedDocument<Assessment>;
export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
