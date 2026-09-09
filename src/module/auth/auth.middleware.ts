import { NestMiddleware } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../common/exceptions/api-error.exception.js';
import { ConfigService } from '../../config/config.service.js';

export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw ApiError.unauthorized('Missing Authorization header');
    }

    const [scheme, token, ...extraParts] = authHeader.split(' ');
    if (!token || extraParts.length > 0 || scheme.toLowerCase() !== 'bearer') {
      throw ApiError.unauthorized('Invalid Authorization header');
    }

    try {
      const user = await this.authService.verifyToken(
        token,
        this.configService.jwtSecret as string,
      );
      req.userId = user.id;

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.unauthorized('Invalid Token or Token is Expired');
    }
  }
}
