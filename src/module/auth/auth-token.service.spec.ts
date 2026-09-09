import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenService } from './auth-token.service.js';
import { ConfigService } from '../../config/config.service.js';

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  const jwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };
  const configService = {
    jwtSecret: 'access-secret',
    refreshSecret: 'refresh-secret',
    refreshExpiresIn: '7d',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthTokenService>(AuthTokenService);
  });

  it('issues access and refresh tokens with separate signing settings', async () => {
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(service.issueTokenPair('user-id')).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, { id: 'user-id' });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { id: 'user-id' },
      { secret: 'refresh-secret', expiresIn: '7d' },
    );
  });

  it('rejects a token without a user id', async () => {
    jwtService.verifyAsync.mockResolvedValue({});

    await expect(service.verifyAccessToken('invalid-token')).rejects.toMatchObject({
      status: 401,
    });
  });
});