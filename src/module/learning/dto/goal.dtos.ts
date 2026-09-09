import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const GOAL_STATUS = [
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ABANDONED',
] as const;

export const createGoalPayloadSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  targetDifficulty: z.number().min(1).max(5).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateGoalPayload = z.infer<typeof createGoalPayloadSchema>;

export const updateGoalStatusPayloadSchema = z.object({
  status: z.enum(GOAL_STATUS),
});

export type UpdateGoalStatusPayload = z.infer<
  typeof updateGoalStatusPayloadSchema
>;

/**
 * Swagger-annotated DTO for the create learning goal endpoint.
 */
export class CreateGoalBodyDto {
  @ApiProperty({
    description: 'Learning goal title (3-150 characters)',
    example: 'Learn TypeScript fundamentals',
    minLength: 3,
    maxLength: 150,
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Goal description / learner intent (max 2000 characters)',
    example: 'Master TypeScript type system and generics',
    maxLength: 2000,
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Initial/target difficulty level (1-5)',
    example: 3,
    minimum: 1,
    maximum: 5,
    nullable: true,
  })
  targetDifficulty?: number | null;

  @ApiPropertyOptional({
    description: 'Goal-specific metadata',
    example: { source: 'user-input' },
  })
  metadata?: Record<string, any>;
}

/**
 * Swagger-annotated DTO for updating a learning goal's status.
 */
export class UpdateGoalStatusBodyDto {
  @ApiProperty({
    description: 'New goal status',
    enum: GOAL_STATUS,
    example: 'ACTIVE',
  })
  status: (typeof GOAL_STATUS)[number];
}
