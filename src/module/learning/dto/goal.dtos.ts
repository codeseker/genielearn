import { z } from 'zod';

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
