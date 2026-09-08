import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Modules collection — demand-generated course modules.
 *
 * Modules are generated incrementally instead of creating the complete
 * course in one transaction.
 *
 * Design notes:
 * - courseId must reference an existing course.
 * - order must be unique within a course.
 * - conceptIds must reference valid concepts.
 * - status values: GENERATING, AVAILABLE, IN_PROGRESS, COMPLETED, ARCHIVED.
 * - Modules should generally be archived rather than physically deleted
 *   once learner evidence exists against them.
 */
@Schema({
  timestamps: true,
  collection: "modules",
})
export class CourseModule {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Parent course.
   * Required reference to courses._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "Course",
  })
  courseId: Types.ObjectId;

  /**
   * Module title.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  /**
   * Module description.
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
   * Module position within the course.
   * Required, unique within a course.
   */
  @Prop({
    required: true,
  })
  order: number;

  /**
   * Module lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["GENERATING", "AVAILABLE", "IN_PROGRESS", "COMPLETED", "ARCHIVED"],
    default: "GENERATING",
  })
  status: string;

  /**
   * Module difficulty.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  difficulty: number | null;

  /**
   * Concepts covered by the module.
   * References to concepts._id.
   */
  @Prop({
    required: false,
    type: [Types.ObjectId],
    ref: "Concept",
    default: () => [],
  })
  conceptIds: Types.ObjectId[];

  /**
   * Bounded module metadata.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type CourseModuleDocument = HydratedDocument<CourseModule>;
export const CourseModuleSchema = SchemaFactory.createForClass(CourseModule);
