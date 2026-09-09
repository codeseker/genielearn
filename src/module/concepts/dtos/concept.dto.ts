import { z } from 'zod';

export const createConceptPayloadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).nullable().optional(),
  domain: z.string().trim().max(100).nullable().optional(),
  difficulty: z.number().min(1).max(5).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateConceptPayload = z.infer<typeof createConceptPayloadSchema>;

export const updateConceptPayloadSchema = createConceptPayloadSchema
  .partial()
  .omit({ metadata: true })
  .extend({
    metadata: z.record(z.string(), z.unknown()).optional(),
  });

export type UpdateConceptPayload = z.infer<typeof updateConceptPayloadSchema>;
