import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthTokenService } from './auth-token.service.js';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../common/exceptions/api-error.exception.js';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: AuthTokenService) {}

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
      const user = await this.tokenService.verifyAccessToken(token);
      req.userId = user.id;

      next();
    } catch (error) {
      console.log('ERROR: ', error);
      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.unauthorized('Invalid Token or Token is Expired');
    }
  }
}
