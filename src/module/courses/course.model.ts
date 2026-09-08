import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Courses collection — course container associated with a learning goal.
 *
 * A course is not the complete generated curriculum; its modules and
 * lessons are generated on demand.
 *
 * Design notes:
 * - One learning goal has at most one course (unique goalId).
 * - slug must be unique.
 * - status values: ACTIVE, PAUSED, COMPLETED, ARCHIVED.
 * - A course should not be independently deleted while its goal remains
 *   active. Prefer ARCHIVED over physical deletion.
 */
@Schema({
  timestamps: true,
  collection: "courses",
})
export class Course {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Learning goal represented by this course.
   * Required, unique reference to learning_goals._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "LearningGoal",
    unique: true,
  })
  goalId: Types.ObjectId;

  /**
   * Course title.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  /**
   * Course description.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    type: String,
    default: null,
    trim: true,
  })
  description: string | null;

  /**
   * Stable course slug.
   * Required, unique, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  slug: string;

  /**
   * Course lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"],
    default: "ACTIVE",
  })
  status: string;

  /**
   * Bounded course metadata.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type CourseDocument = HydratedDocument<Course>;
export const CourseSchema = SchemaFactory.createForClass(Course);
