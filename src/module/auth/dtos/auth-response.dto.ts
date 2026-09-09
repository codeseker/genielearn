import { ApiProperty } from '@nestjs/swagger';

/**
 * Token pair returned by login, register, and refresh endpoints.
 */
export class TokenPairDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

/**
 * Auth user data returned in login and register responses.
 */
export class AuthUserDataDto {
  @ApiProperty({
    description: 'Unique user identifier (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Account status',
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED'],
    example: 'PENDING',
  })
  status: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

/**
 * Response data for successful registration.
 */
export class RegisterResponseDataDto {
  @ApiProperty({ type: AuthUserDataDto })
  user: AuthUserDataDto;
}

/**
 * Response data for successful login.
 */
export class LoginResponseDataDto {
  @ApiProperty({ type: AuthUserDataDto })
  user: AuthUserDataDto;
}

/**
 * Response data for successful token refresh.
 */
export class RefreshTokenResponseDataDto {
  @ApiProperty({ type: TokenPairDto })
  tokens: TokenPairDto;
}
