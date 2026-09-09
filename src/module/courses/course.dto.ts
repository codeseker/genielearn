import { z } from 'zod';

export const COURSE_STATUS = [
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED',
] as const;

export const createCoursePayloadSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
});

export type CreateCoursePayload = z.infer<typeof createCoursePayloadSchema>;

export const updateCourseStatusPayloadSchema = z.object({
  status: z.enum(COURSE_STATUS),
});

export type UpdateCourseStatusPayload = z.infer<
  typeof updateCourseStatusPayloadSchema
>;
