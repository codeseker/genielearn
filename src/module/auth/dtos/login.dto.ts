import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginDTO = z.infer<typeof loginSchema>;

/**
 * Swagger-annotated DTO for the login endpoint request body.
 */
export class LoginBodyDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Account password (minimum 8 characters)',
    example: 'securePassword123',
    minLength: 8,
  })
  password: string;
}
