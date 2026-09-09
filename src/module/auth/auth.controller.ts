import { Body, Controller, Post, Req, UsePipes } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { type RegisterDto, registerSchema, RegisterBodyDto } from './dtos/register.dto.js';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import { AuthService } from './auth.service.js';
import { type LoginDTO, loginSchema, LoginBodyDto } from './dtos/login.dto.js';
import type { Request } from 'express';
import {
  type RefreshTokenDTO,
  refreshTokenSchema,
  RefreshTokenBodyDto,
} from './dtos/refreshToken.dto.js';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email, password, and profile information. '
      + 'Returns JWT access and refresh tokens upon successful registration.',
  })
  @ApiBody({ type: RegisterBodyDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'User Registered Successfully' } } },
        { properties: { data: { $ref: '#/components/schemas/AuthUserDataDto' } } },
      ],
    },
  })
  @ApiConflictResponse({
    description: 'Email already exists',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'This email already exists.' } } },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Validation failed' } } },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body({ schema: registerSchema }) registerDTO: RegisterDto) {
    const user = await this.authService.register(registerDTO);
    return {
      message: 'User Registered Successfully',
      data: user,
    };
  }

  @Post('/login')
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates a user with email and password. '
      + 'Returns JWT access and refresh tokens upon successful authentication.',
  })
  @ApiBody({ type: LoginBodyDto })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Login Successfull' } } },
        { properties: { data: { $ref: '#/components/schemas/AuthUserDataDto' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or inactive/deleted account',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Invalid credentials' } } },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Validation failed' } } },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body({ schema: loginSchema }) loginDTO: LoginDTO) {
    const user = await this.authService.login(loginDTO);
    return {
      message: 'Login Successfull',
      data: user,
    };
  }

  @Post('/logout')
  @ApiOperation({
    summary: 'Logout current user',
    description:
      'Invalidate the current user\'s refresh token. '
      + 'Requires a valid JWT access token in the Authorization header.',
  })
  @ApiBearerAuth('bearer-auth')
  @ApiOkResponse({
    description: 'Logout successful',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Logout Successfull' } } },
        { properties: { data: { example: null } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Unauthorized Access' } } },
      ],
    },
  })
  async logout(@Req() req: Request) {
    const userId = req.userId;
    await this.authService.logout(userId);
    return {
      message: 'Logout Successfull',
    };
  }

  @Post('/refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Issues a new access token and refresh token pair using a valid refresh token. '
      + 'The old refresh token is invalidated.',
  })
  @ApiBody({ type: RefreshTokenBodyDto })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Token Refreshed Successfully' } } },
        { properties: { data: { $ref: '#/components/schemas/TokenPairDto' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Invalid Refresh Token' } } },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. missing refresh token)',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Validation failed' } } },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  async refreshToken(
    @Body({ schema: refreshTokenSchema }) refreshTokenDTO: RefreshTokenDTO,
  ) {
    const response = await this.authService.refreshToken(refreshTokenDTO);
    return {
      message: 'Token Refreshed Successfully',
      data: response,
    };
  }

  socialLogin() {}
}
