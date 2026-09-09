import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto.js';
import { RoleRepository } from './repository/role.repository.js';
import { ApiError } from '../../common/exceptions/api-error.exception.js';
import { AuthRepository } from './repository/auth.repository.js';
import { AuthProviders, AuthStatus } from './auth.constants.js';
import { BcryptService } from '../../common/utils/bcrypt.js';
import { LoginDTO } from './dtos/login.dto.js';
import { RefreshTokenDTO } from './dtos/refreshToken.dto.js';
import { AuthTokenService } from './auth-token.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly authRepo: AuthRepository,
    private readonly tokenService: AuthTokenService,
    private readonly passwordService: BcryptService,
  ) {}

  async register(userDTO: RegisterDto) {
    const role = await this.roleRepo.findOne({ name: 'regular_user' });
    if (!role) {
      throw ApiError.notFound('Default User Role Not Found');
    }

    const { email, password } = userDTO;

    if (await this.authRepo.exists({ email, isDeleted: false })) {
      throw ApiError.conflict('This email already exists.');
    }

    const hashedPassword = await this.passwordService.hash(password);

    const authUser = await this.authRepo.create({
      email,
      status: AuthStatus.PENDING,
      role: role._id,
      passwordHash: hashedPassword,
      authProvider: AuthProviders.LOCAL,
      refreshToken: null,
    });

    const tokens = await this.tokenService.issueTokenPair(String(authUser._id));

    await this.authRepo.updateById(authUser._id, {
      refreshToken: await this.passwordService.hash(tokens.refreshToken),
    });

    return {
      id: authUser._id,
      email: authUser.email,
      status: authUser.status,
      ...tokens,
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
      throw ApiError.unauthorized('User account is inactive or deleted');
    }

    if (
      authUser.authProvider !== AuthProviders.LOCAL ||
      !authUser.passwordHash
    ) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isSafe = await this.passwordService.compare(
      password,
      authUser.passwordHash,
    );

    if (!isSafe) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const tokens = await this.tokenService.issueTokenPair(String(authUser._id));

    await this.authRepo.updateById(authUser._id, {
      refreshToken: await this.passwordService.hash(tokens.refreshToken),
    });

    return {
      id: authUser._id,
      email: authUser.email,
      status: authUser.status,
      ...tokens,
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
    const decoded = await this.tokenService.verifyRefreshToken(refreshToken);

    const authUser = await this.authRepo.findById(decoded.id);
    if (!authUser) {
      throw ApiError.unauthorized('Invalid Refresh Token');
    }

    if (
      !authUser.refreshToken ||
      !(await this.passwordService.compare(refreshToken, authUser.refreshToken))
    ) {
      throw ApiError.unauthorized('Invalid Refresh Token');
    }

    const tokens = await this.tokenService.issueTokenPair(String(authUser._id));

    await this.authRepo.updateById(authUser._id, {
      refreshToken: await this.passwordService.hash(tokens.refreshToken),
    });

    return {
      ...tokens,
    };
  }
}
