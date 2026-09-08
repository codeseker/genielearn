import { Body, Controller, Post, Req, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { type RegisterDto, registerSchema } from './dtos/register.dto.js';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';

@Controller('auth')
export class AuthController {

    @Post("/register")
    @UsePipes(new ZodValidationPipe(registerSchema))
    register(@Req() request: Request,
        @Body({ schema: registerSchema }) registerDTO: RegisterDto) {
        const { username, email, password, firstName, lastName } = registerDTO;
        return { message: 'User registered successfully', data: "DONE" };
    }

    login() {

    }

    logout() {

    }

    refreshToken() {

    }

    socialLogin() {

    }
}
