import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const ASSESSMENT_TYPE = [
  'PREREQUISITE',
  'CONCEPT',
  'LESSON',
  'ADAPTIVE',
] as const;

export const createAssessmentPayloadSchema = z.object({
  type: z.enum(ASSESSMENT_TYPE),
  targetConceptId: z.string().min(1, 'targetConceptId is required'),
});

export type CreateAssessmentPayload = z.infer<
  typeof createAssessmentPayloadSchema
>;

export const submitAssessmentAttemptPayloadSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOption: z.string().min(1),
      }),
    )
    .min(1, 'At least one answer is required'),
});

export type SubmitAssessmentAttemptPayload = z.infer<
  typeof submitAssessmentAttemptPayloadSchema
>;

/** Swagger DTO for creating an assessment. */
export class CreateAssessmentBodyDto {
  @ApiProperty({
    description: 'Assessment type',
    enum: ASSESSMENT_TYPE,
    example: 'PREREQUISITE',
  })
  type: (typeof ASSESSMENT_TYPE)[number];

  @ApiProperty({
    description:
      'MongoDB ObjectId of the concept to assess (must already exist)',
    example: '507f1f77bcf86cd799439011',
  })
  targetConceptId: string;
}

/** Swagger DTO for submitting an assessment attempt. */
export class SubmitAttemptBodyDto {
  @ApiProperty({
    description: 'Array of user answers',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        questionId: { type: 'string', example: 'q-0' },
        selectedOption: { type: 'string', example: 'A) TCP' },
      },
    },
    minItems: 1,
  })
  answers: { questionId: string; selectedOption: string }[];
}
