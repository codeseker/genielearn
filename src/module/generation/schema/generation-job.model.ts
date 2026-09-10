import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GenerationJobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'DEAD_LETTERED'
  | 'CANCELLED';

export type GenerationJobType = 'LEARNING_ANALYSIS';

@Schema({
  timestamps: true,
  collection: 'generation_jobs',
})
export class GenerationJob {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    index: true,
  })
  generationKey: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'UserProfile',
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'LearningGoal',
  })
  goalId: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  type: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING', 'DEAD_LETTERED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: GenerationJobStatus;

  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  attempts: number;

  @Prop({
    required: true,
    type: Number,
    default: 3,
  })
  maxAttempts: number;

  @Prop({
    required: false,
    type: Object,
    default: null,
  })
  error: Record<string, unknown> | null;

  @Prop({
    required: false,
    type: Date,
    default: null,
  })
  startedAt: Date | null;

  @Prop({
    required: false,
    type: Date,
    default: null,
  })
  completedAt: Date | null;
}

export type GenerationJobDocument = HydratedDocument<GenerationJob>;
export const GenerationJobSchema = SchemaFactory.createForClass(GenerationJob);

// Indexes
GenerationJobSchema.index({ generationKey: 1 }, { unique: true });
GenerationJobSchema.index({ goalId: 1, type: 1 });
