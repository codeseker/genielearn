import { z } from 'zod';

export const createPromptVersionSchema = z.object({
  promptId: z.string().min(1),
  agent: z.enum(['curriculum-agent', 'content-agent', 'critic-agent', 'learning-agent']),
  systemPrompt: z.string().min(1),
  outputSchema: z.record(z.string(), z.unknown()).default({}),
  model: z.string().optional().nullable(),
  configuration: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreatePromptVersionPayload = z.infer<typeof createPromptVersionSchema>;

export const updatePromptVersionSchema = z.object({
  systemPrompt: z.string().min(1).optional(),
  outputSchema: z.record(z.string(), z.unknown()).optional(),
  model: z.string().nullable().optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED']).optional(),
});

export type UpdatePromptVersionPayload = z.infer<typeof updatePromptVersionSchema>;
