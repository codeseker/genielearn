import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto.js';
import { RoleRepository } from './repository/role.repository.js';
import { ApiError } from '../../common/exceptions/api-error.exception.js';
import { AuthRepository } from './repository/auth.repository.js';
import { AuthProviders, AuthStatus } from './auth.constants.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly authRepo: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async register(userDTO: RegisterDto) {
    const role = await this.roleRepo.findOne({ name: 'regular_user' });
    if (!role) {
      throw ApiError.notFound('Default User Role Not Found');
    }

    const { email } = userDTO;
    const authUser = await this.authRepo.create({
      email,
      status: AuthStatus.PENDING,
      role: role._id,
      authProvider: AuthProviders.LOCAL,
      refreshToken: null,
    });

    const access_token = await this.jwtService.signAsync({
      id: authUser._id,
    });

    await this.authRepo.updateById(authUser._id, {
      refreshToken: access_token,
    });

    return {
      id: authUser._id,
      email: authUser.email,
      status: authUser.status,
      refreshToken: access_token,
    };
  }
}
