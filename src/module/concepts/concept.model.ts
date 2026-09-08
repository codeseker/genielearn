import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Concepts collection — reusable learning concepts independent from
 * a specific generated course.
 *
 * A concept is a reusable unit of knowledge such as:
 * - HTTP
 * - HTTP methods
 * - Idempotency
 * - Redis eviction policies
 * - Database indexes
 *
 * Design notes:
 * - slug must be unique and stable.
 * - difficulty, when present, must use the application's supported scale.
 * - Concept identity must be stable enough to be referenced by learner
 *   state and evidence.
 */
@Schema({
  timestamps: true,
  collection: "concepts",
})
export class Concept {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Concept name.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  /**
   * Stable concept slug.
   * Required, unique, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  slug: string;

  /**
   * Concept description.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  description: string | null;

  /**
   * Broad subject/domain.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  domain: string | null;

  /**
   * Baseline concept difficulty.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
  })
  difficulty: number | null;

  /**
   * Bounded concept metadata.
   * Must not replace core concept identity fields.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type ConceptDocument = HydratedDocument<Concept>;
export const ConceptSchema = SchemaFactory.createForClass(Concept);
