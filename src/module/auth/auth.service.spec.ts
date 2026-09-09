import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { RoleRepository } from './repository/role.repository.js';
import { AuthRepository } from './repository/auth.repository.js';
import { AuthTokenService } from './auth-token.service.js';
import { BcryptService } from '../../common/utils/bcrypt.js';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: RoleRepository, useValue: {} },
        { provide: AuthRepository, useValue: {} },
        { provide: AuthTokenService, useValue: {} },
        { provide: BcryptService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
