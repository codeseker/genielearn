import { Body, Controller, Post, Req, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { type RegisterDto, registerSchema } from './dtos/register.dto.js';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Req() request: Request,
    @Body({ schema: registerSchema }) registerDTO: RegisterDto,
  ) {
    const user = await this.authService.register(registerDTO);
    return {
      message: 'User Registered Successfully',
      data: user,
    };
  }

  login() {}

  logout() {}

  refreshToken() {}

  socialLogin() {}
}
