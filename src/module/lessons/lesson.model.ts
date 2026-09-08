import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Lessons collection — individual learning units within a module.
 *
 * Lessons may be normal instruction, review, remediation, reinforcement,
 * or assessment-oriented units.
 *
 * Design notes:
 * - moduleId must reference an existing module.
 * - order must be unique within a module.
 * - currentVersionId, when present, must reference a published/usable
 *   content_versions record.
 * - conceptIds must reference valid concepts.
 * - type values: LESSON, REVIEW, REMEDIAL, REINFORCEMENT, ASSESSMENT.
 * - status values: GENERATING, AVAILABLE, IN_PROGRESS, COMPLETED, ARCHIVED.
 */
@Schema({
  timestamps: true,
  collection: "lessons",
})
export class Lesson {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Parent module.
   * Required reference to modules._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "CourseModule",
  })
  moduleId: Types.ObjectId;

  /**
   * Lesson title.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  /**
   * Lesson summary.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  description: string | null;

  /**
   * Lesson position within module.
   * Required, unique within a module.
   */
  @Prop({
    required: true,
  })
  order: number;

  /**
   * Learning-unit type.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["LESSON", "REVIEW", "REMEDIAL", "REINFORCEMENT", "ASSESSMENT"],
    default: "LESSON",
  })
  type: string;

  /**
   * Lesson lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["GENERATING", "AVAILABLE", "IN_PROGRESS", "COMPLETED", "ARCHIVED"],
    default: "GENERATING",
  })
  status: string;

  /**
   * Current lesson difficulty.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
  })
  difficulty: number | null;

  /**
   * Concepts taught/assessed.
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
   * Published/current content version.
   * Optional reference to content_versions._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "ContentVersion",
  })
  currentVersionId: Types.ObjectId | null;

  /**
   * Bounded lesson metadata.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type LessonDocument = HydratedDocument<Lesson>;
export const LessonSchema = SchemaFactory.createForClass(Lesson);
