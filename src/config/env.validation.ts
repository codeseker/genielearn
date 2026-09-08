import { z } from 'zod';

export const envSchema = z.object({
  APP_MODE: z.enum(['dev', 'prod', 'test']),
  MONGO_URI_DEV: z.string().min(1).optional(),
  MONGO_URI_PROD: z.string().min(1).optional(),
  MONGO_URI_TEST: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(1).optional(),
  JWT_EXPIRES_IN: z.coerce.number().optional(),
  REFRESH_SECRET: z.string().min(1).optional(),
  REFRESH_EXPIRES_IN: z.coerce.number().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_REDIRECT_URI: z.string().min(1).optional(),
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const issues = JSON.stringify(result.error.flatten().fieldErrors, null, 2);
    throw new Error(`Environment validation failed:\n${issues}`);
  }

  return result.data;
}
