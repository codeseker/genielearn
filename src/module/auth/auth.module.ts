import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './entities/auth.model.js';
import { Permission, PermissionSchema } from './entities/permission.model.js';
import { Role, RoleSchema } from './entities/role.model.js';
import {
  RoleWithPermissions,
  RoleWithPermissionsSchema,
} from './entities/roleWithPermissions.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RoleRepository } from './repository/role.repository.js';
import { AuthRepository } from './repository/auth.repository.js';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants.js';
import { ConfigService } from '../../config/config.service.js';
import { ConfigModule } from '../../config/config.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Auth.name,
        schema: AuthSchema,
        collection: 'auths',
      },
      {
        name: Permission.name,
        schema: PermissionSchema,
        collection: 'permissions',
      },
      {
        name: Role.name,
        schema: RoleSchema,
        collection: 'roles',
      },
      {
        name: RoleWithPermissions.name,
        schema: RoleWithPermissionsSchema,
        collection: 'role_permissions',
      },
    ]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { access_token_secret, access_token_expiry } =
          jwtConstants(configService);

        return {
          secret: access_token_secret,
          signOptions: {
            expiresIn: access_token_expiry,
          },
        };
      },
    }),
    UsersModule,
  ],
  exports: [MongooseModule],
  controllers: [AuthController],
  providers: [AuthService, RoleRepository, AuthRepository],
})
export class AuthModule {}
