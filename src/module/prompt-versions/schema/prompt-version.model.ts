import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PromptVersionAgent =
  | 'curriculum-agent'
  | 'content-agent'
  | 'critic-agent'
  | 'learning-agent';

export type PromptVersionStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';

@Schema({
  timestamps: true,
  collection: 'prompt_versions',
})
export class PromptVersion {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  promptId: string;

  @Prop({
    required: true,
    type: Number,
    min: 1,
  })
  version: number;

  @Prop({
    required: true,
    trim: true,
    enum: ['curriculum-agent', 'content-agent', 'critic-agent', 'learning-agent'],
  })
  agent: PromptVersionAgent;

  @Prop({
    required: true,
    trim: true,
  })
  systemPrompt: string;

  @Prop({
    required: true,
    type: Object,
    default: () => ({}),
  })
  outputSchema: Record<string, unknown>;

  @Prop({
    required: false,
    trim: true,
    default: null,
  })
  model: string | null;

  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  configuration: Record<string, unknown>;

  @Prop({
    required: true,
    trim: true,
    enum: ['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED'],
    default: 'DRAFT',
  })
  status: PromptVersionStatus;

  createdAt: Date;
  updatedAt: Date;
}

export type PromptVersionDocument = HydratedDocument<PromptVersion>;
export const PromptVersionSchema = SchemaFactory.createForClass(PromptVersion);

// Unique compound index on { promptId: 1, version: 1 }
PromptVersionSchema.index({ promptId: 1, version: 1 }, { unique: true });
