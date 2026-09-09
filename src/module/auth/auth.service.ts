import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto.js';
import { RoleRepository } from './repository/role.repository.js';
import { ApiError } from '../../common/exceptions/api-error.exception.js';
import { AuthRepository } from './repository/auth.repository.js';
import { AuthProviders, AuthStatus } from './auth.constants.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service.js';
import { BcryptService } from '../../common/utils/bcrypt.js';
import { LoginDTO } from './dtos/login.dto.js';
import { AuthTokenPayload } from './auth.types.js';
import { RefreshTokenDTO } from './dtos/refreshToken.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly authRepo: AuthRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verifyToken(token: string, secret: string): Promise<AuthTokenPayload> {
    const decoded = await this.jwtService.verifyAsync<AuthTokenPayload>(token, {
      secret,
    });

    if (!decoded || typeof decoded.id !== 'string' || !decoded.id) {
      throw ApiError.unauthorized('Invalid Token or Token is Expired');
    }

    return decoded;
  }

  private async generateTokenPairs(id: string) {
    const access_token = await this.jwtService.signAsync({
      id,
    });

    const refresh_token = await this.jwtService.signAsync(
      {
        id,
      },
      {
        secret: this.configService.refreshSecret as string,
        expiresIn: this.configService.refreshExpiresIn,
      },
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async register(userDTO: RegisterDto) {
    const role = await this.roleRepo.findOne({ name: 'regular_user' });
    if (!role) {
      throw ApiError.notFound('Default User Role Not Found');
    }

    const { email, password } = userDTO;

    if (await this.authRepo.exists({ email, isDeleted: false })) {
      throw ApiError.conflict('This email already exists.');
    }

    const hashedPassword = await BcryptService.hash(password);

    const authUser = await this.authRepo.create({
      email,
      status: AuthStatus.PENDING,
      role: role._id,
      passwordHash: hashedPassword,
      authProvider: AuthProviders.LOCAL,
      refreshToken: null,
    });

    const { access_token, refresh_token } = await this.generateTokenPairs(
      authUser._id,
    );

    await this.authRepo.updateById(authUser._id, {
      refreshToken: refresh_token,
    });

    return {
      id: authUser._id,
      email: authUser.email,
      status: authUser.status,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    const authUser = await this.authRepo.findOne({
      email: email,
    });

    if (!authUser) {
      throw ApiError.notFound('User not found');
    }

    if (authUser.isDeleted || authUser.status === AuthStatus.INACTIVE) {
      return ApiError.unauthorized('User account is inactive or deleted');
    }

    if (
      authUser.authProvider !== AuthProviders.LOCAL ||
      !authUser.passwordHash
    ) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isSafe = await BcryptService.compare(password, authUser.passwordHash);

    if (!isSafe) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const { access_token, refresh_token } = await this.generateTokenPairs(
      authUser._id,
    );

    await this.authRepo.updateById(authUser._id, {
      refreshToken: refresh_token,
    });

    return {
      id: authUser._id,
      email: authUser.email,
      status: authUser.status,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }

  async logout(userId: string | undefined) {
    if (!userId) {
      throw ApiError.unauthorized('Unauthorized Access');
    }

    await this.authRepo.updateById(userId, {
      refreshToken: null,
    });

    return null;
  }

  async refreshToken(refreshTokenDTO: RefreshTokenDTO) {
    const { refreshToken } = refreshTokenDTO;
    const decoded = await this.verifyToken(
      refreshToken,
      this.configService.refreshSecret as string,
    );

    const authUser = await this.authRepo.findById(decoded.id);
    if (!authUser) {
      throw ApiError.unauthorized('Invalid Refresh Token');
    }

    const { access_token, refresh_token } = await this.generateTokenPairs(
      authUser._id,
    );

    await this.authRepo.updateById(authUser._id, {
      refreshToken: refresh_token,
    });

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }
}
