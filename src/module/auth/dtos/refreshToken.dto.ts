import { z } from 'zod';

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token is required'),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
