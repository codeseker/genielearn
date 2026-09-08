import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * PromptVersions collection — version-controls prompts used by AI agents
 * so that agent behavior and cost can be audited and compared over time.
 *
 * Design notes:
 * - (promptId, version) must be unique.
 * - Prompt versions referenced by historical agent runs must not be deleted
 *   in a way that destroys auditability.
 * - status values: DRAFT, ACTIVE, DEPRECATED, ARCHIVED.
 */
@Schema({
  timestamps: true,
  collection: "prompt_versions",
})
export class PromptVersion {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Logical prompt identifier.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  promptId: string;

  /**
   * Prompt version number.
   * Required.
   */
  @Prop({
    required: true,
  })
  version: number;

  /**
   * Agent using the prompt.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  agent: string;

  /**
   * System/instruction prompt.
   * Required.
   */
  @Prop({
    required: true,
  })
  systemPrompt: string;

  /**
   * Structured output schema/configuration.
   * Required.
   */
  @Prop({
    required: true,
    type: Object,
  })
  outputSchema: Record<string, any>;

  /**
   * Preferred/default model.
   * Optional, nullable.
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  model: string | null;

  /**
   * Model configuration.
   * Optional, defaults to {}.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  configuration: Record<string, any>;

  /**
   * Prompt lifecycle status.
   */
  @Prop({
    required: true,
    type: String,
    enum: ["DRAFT", "ACTIVE", "DEPRECATED", "ARCHIVED"],
    default: "DRAFT",
  })
  status: string;
}

export type PromptVersionDocument = HydratedDocument<PromptVersion>;
export const PromptVersionSchema = SchemaFactory.createForClass(PromptVersion);
