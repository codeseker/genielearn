import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token is required'),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

/**
 * Swagger-annotated DTO for the refresh token endpoint request body.
 */
export class RefreshTokenBodyDto {
  @ApiProperty({
    description: 'JWT refresh token obtained during login or registration',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
