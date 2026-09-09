import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

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

/**
 * Swagger-annotated DTO for updating a course's status.
 */
export class UpdateCourseStatusBodyDto {
  @ApiProperty({
    description: 'New course status',
    enum: COURSE_STATUS,
    example: 'ACTIVE',
  })
  status: (typeof COURSE_STATUS)[number];
}
