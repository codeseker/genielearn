import { ConfigService } from '../../config/config.service.js';

export enum AuthStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum AuthProviders {
  GOOGLE = "google",
  GITHUB = "github",
  LOCAL = "local",
}

export enum UserRoles {
  USER = "USER",
  ADMIN = "ADMIN",
}

/**
 * Normalized email comparison helper.
 * MongoDB unique indexes are case-sensitive by default,
 * so we store a normalized form for lookups.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}


export const jwtConstants = (configService: ConfigService) => {
  const accessTokenSecret = configService.jwtSecret;
  const refreshTokenSecret = configService.refreshSecret;

  if (!accessTokenSecret || !refreshTokenSecret) {
    throw new Error('JWT_SECRET and REFRESH_SECRET must be configured');
  }

  return {
    access_token_secret: accessTokenSecret,
    refresh_token_secret: refreshTokenSecret,
    access_token_expiry: configService.jwtExpiresIn,
    refresh_token_expiry: configService.refreshExpiresIn
  };
};