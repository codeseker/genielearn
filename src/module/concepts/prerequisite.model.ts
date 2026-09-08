import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Prerequisites collection — directed prerequisite relationships
 * between reusable concepts.
 *
 * Example:
 *   HTTP methods → Idempotency
 *
 * This is a self-referencing many-to-many graph implemented through
 * the prerequisites edge collection.
 *
 * Design notes:
 * - conceptId != prerequisiteConceptId (cannot be self-referential).
 * - The pair (conceptId, prerequisiteConceptId) must be unique.
 * - The application should prevent invalid/cyclic prerequisite graphs.
 */
@Schema({
  timestamps: true,
  collection: "prerequisites",
})
export class Prerequisite {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Concept requiring the prerequisite.
   * Required reference to concepts._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "Concept",
  })
  conceptId: Types.ObjectId;

  /**
   * Required prerequisite concept.
   * Required reference to concepts._id.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "Concept",
  })
  prerequisiteConceptId: Types.ObjectId;

  /**
   * Bounded relationship metadata.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type PrerequisiteDocument = HydratedDocument<Prerequisite>;
export const PrerequisiteSchema = SchemaFactory.createForClass(Prerequisite);
