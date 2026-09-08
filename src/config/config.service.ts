import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { EnvConfig } from './env.validation.js';

@Injectable()
export class ConfigService {
  constructor(
    private readonly nestConfigService: NestConfigService<EnvConfig, true>,
  ) {}

  /** Selects the application mode used by the runtime. */
  get appMode(): EnvConfig['APP_MODE'] {
    return this.getRequired('APP_MODE');
  }

  /** Returns the development MongoDB connection string. */
  get mongoUriDev(): string | undefined {
    return this.getOptional('MONGO_URI_DEV');
  }

  /** Returns the production MongoDB connection string. */
  get mongoUriProd(): string | undefined {
    return this.getOptional('MONGO_URI_PROD');
  }

  /** Returns the test MongoDB connection string. */
  get mongoUriTest(): string | undefined {
    return this.getOptional('MONGO_URI_TEST');
  }

  /** Returns the JWT signing secret. */
  get jwtSecret(): string | undefined {
    return this.getOptional('JWT_SECRET');
  }

  /** Returns the JWT lifetime in seconds. */
  get jwtExpiresIn(): number | undefined {
    return this.getOptional('JWT_EXPIRES_IN');
  }

  /** Returns the refresh-token signing secret. */
  get refreshSecret(): string | undefined {
    return this.getOptional('REFRESH_SECRET');
  }

  /** Returns the refresh-token lifetime in seconds. */
  get refreshExpiresIn(): number | undefined {
    return this.getOptional('REFRESH_EXPIRES_IN');
  }

  /** Returns the Google OAuth client identifier. */
  get googleClientId(): string | undefined {
    return this.getOptional('GOOGLE_CLIENT_ID');
  }

  /** Returns the Google OAuth client secret. */
  get googleClientSecret(): string | undefined {
    return this.getOptional('GOOGLE_CLIENT_SECRET');
  }

  /** Returns the Google OAuth redirect URI. */
  get googleRedirectUri(): string | undefined {
    return this.getOptional('GOOGLE_REDIRECT_URI');
  }

  /** Returns the HTTP port used by the Nest application. */
  get port(): number {
    return this.getRequired('PORT');
  }

  /** Returns the current Nest environment. */
  get nodeEnv(): EnvConfig['NODE_ENV'] {
    return this.getRequired('NODE_ENV');
  }

  private getRequired<Key extends keyof EnvConfig>(key: Key): NonNullable<EnvConfig[Key]> {
    const value = this.nestConfigService.get(key, { infer: true });

    if (value === undefined || value === null || value === '') {
      throw new Error(`Required environment variable ${String(key)} is unexpectedly undefined`);
    }

    return value as NonNullable<EnvConfig[Key]>;
  }

  private getOptional<Key extends keyof EnvConfig>(key: Key): EnvConfig[Key] {
    return this.nestConfigService.get(key, { infer: true });
  }
}