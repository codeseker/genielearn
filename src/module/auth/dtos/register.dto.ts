import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;

/**
 * Swagger-annotated DTO for the register endpoint request body.
 * Mirrors the Zod schema for documentation purposes.
 */
export class RegisterBodyDto {
  @ApiProperty({
    description: 'Unique username (3-30 characters)',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
  })
  username: string;

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

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;
}