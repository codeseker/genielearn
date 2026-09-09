import { Body, Controller, Post, Req, UsePipes } from '@nestjs/common';
import { type RegisterDto, registerSchema } from './dtos/register.dto.js';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import { AuthService } from './auth.service.js';
import { type LoginDTO, loginSchema } from './dtos/login.dto.js';
import type { Request } from 'express';
import {
  type RefreshTokenDTO,
  refreshTokenSchema,
} from './dtos/refreshToken.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body({ schema: registerSchema }) registerDTO: RegisterDto) {
    const user = await this.authService.register(registerDTO);
    return {
      message: 'User Registered Successfully',
      data: user,
    };
  }

  @Post('/login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body({ schema: loginSchema }) loginDTO: LoginDTO) {
    const user = await this.authService.login(loginDTO);
    return {
      message: 'Login Successfull',
      data: user,
    };
  }

  @Post('/logout')
  async logout(@Req() req: Request) {
    const userId = req.userId;
    await this.authService.logout(userId);
    return {
      message: 'Logout Successfull',
    };
  }

  @Post('/refresh')
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
