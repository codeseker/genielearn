import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * ContentVersions collection — immutable/versioned structured content
 * generated for a lesson.
 *
 * The lesson points to the current published version through
 * lessons.currentVersionId.
 *
 * Design notes:
 * - (lessonId, version) must be unique.
 * - qualityScore, when present, must be within [0, 1].
 * - revisionNumber cannot exceed MAX_REVISIONS (3).
 * - Raw/unvalidated LLM output must not be stored as published content.
 * - Content versions should be treated as historical records; do not
 *   delete a version merely because a newer one is published.
 */
@Schema({
  timestamps: true,
  collection: "content_versions",
})
export class ContentVersion {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Lesson owning this version.
   * Required reference to lessons._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "Lesson",
  })
  lessonId: Types.ObjectId;

  /**
   * Monotonically increasing version number.
   * Required.
   */
  @Prop({
    required: true,
  })
  version: number;

  /**
   * Version lifecycle status.
   * Values: DRAFT, EVALUATING, APPROVED, PUBLISHED, REJECTED, ARCHIVED.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["DRAFT", "EVALUATING", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"],
    default: "DRAFT",
  })
  status: string;

  /**
   * Structured validated lesson content.
   *
   * Expected structure:
   * {
   *   title: string,
   *   objective: string,
   *   prerequisites: any[],
   *   sections: any[],
   *   examples: any[],
   *   exercises: any[],
   *   quiz: any[],
   *   conceptualQuestions: any[],
   *   difficulty: number
   * }
   *
   * The exact nested schema is owned by application validation.
   */
  @Prop({
    required: true,
    type: Object,
  })
  content: Record<string, any>;

  /**
   * Prompt used to generate the version.
   * Optional reference to prompt_versions._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "PromptVersion",
  })
  promptVersionId: Types.ObjectId | null;

  /**
   * Generation job that produced it.
   * Optional reference to generation_jobs._id.
   */
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: "GenerationJob",
  })
  generationJobId: Types.ObjectId | null;

  /**
   * Final content-quality score.
   * Optional, must be within [0, 1] when present.
   */
  @Prop({
    required: false,
    default: null,
  })
  qualityScore: number | null;

  /**
   * Revision count for the generation/evaluation cycle.
   * Must not exceed MAX_REVISIONS (3).
   */
  @Prop({
    required: true,
    default: 0,
  })
  revisionNumber: number;
}

export type ContentVersionDocument = HydratedDocument<ContentVersion>;
export const ContentVersionSchema = SchemaFactory.createForClass(ContentVersion);
