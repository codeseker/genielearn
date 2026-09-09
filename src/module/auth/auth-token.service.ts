import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service.js';
import { ApiError } from '../../common/exceptions/api-error.exception.js';
import { AuthTokenPayload, TokenPair } from './auth.types.js';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueTokenPair(userId: string): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync({ id: userId });
    const refreshToken = await this.jwtService.signAsync(
      { id: userId },
      {
        secret: this.getRefreshSecret(),
        expiresIn: this.configService.refreshExpiresIn,
      },
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): Promise<AuthTokenPayload> {
    return this.verify(token, this.getAccessSecret());
  }

  verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    return this.verify(token, this.getRefreshSecret());
  }

  private async verify(
    token: string,
    secret: string,
  ): Promise<AuthTokenPayload> {
    try {
      const decoded = await this.jwtService.verifyAsync<AuthTokenPayload>(
        token,
        { secret },
      );

      if (!decoded.id) {
        throw new Error('Token does not contain a user id');
      }

      return decoded;
    } catch {
      throw ApiError.unauthorized('Invalid Token or Token is Expired');
    }
  }

  private getAccessSecret(): string {
    return this.requireSecret(this.configService.jwtSecret, 'JWT_SECRET');
  }

  private getRefreshSecret(): string {
    return this.requireSecret(this.configService.refreshSecret, 'REFRESH_SECRET');
  }

  private requireSecret(secret: string | undefined, name: string): string {
    if (!secret) {
      throw new Error(`${name} is not configured`);
    }

    return secret;
  }
}