import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService {
  private readonly salt = 10;

  async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.salt);
  }

  async compare(plainText: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedValue);
  }

  isHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
  }

  async generateSalt(): Promise<string> {
    return bcrypt.genSalt(this.salt);
  }

  async hashWithSalt(data: string, salt: string): Promise<string> {
    return bcrypt.hash(data, salt);
  }
}
