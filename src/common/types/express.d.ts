import type { AuthTokenPayload } from '../../module/auth/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      userId?: AuthTokenPayload['id'];
    }
  }
}

export {};