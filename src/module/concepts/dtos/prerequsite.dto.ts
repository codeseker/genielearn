import { z } from 'zod';

export const createPrerequisitePayloadSchema = z
  .object({
    conceptId: z.string(),
    prerequisiteConceptId: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .refine((data) => data.conceptId !== data.prerequisiteConceptId, {
    message: 'conceptId and prerequisiteConceptId must be different',
    path: ['prerequisiteConceptId'],
  });

export type CreatePrerequisitePayload = z.infer<
  typeof createPrerequisitePayloadSchema
>;
