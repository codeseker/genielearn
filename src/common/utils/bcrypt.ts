import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService {
  /**
   * Hash a plain text string.
   */

  constructor(private readonly configServuce: ConfigService) {}
  private static salt = 10;

  static async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.salt);
  }

  /**
   * Compare plain text with hashed value.
   */
  static async compare(
    plainText: string,
    hashedValue: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainText, hashedValue);
  }

  /**
   * Check if a string is already a bcrypt hash.
   */
  static isHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
  }

  /**
   * Generate a salt.
   */
  static async generateSalt(): Promise<string> {
    return bcrypt.genSalt(this.salt);
  }

  /**
   * Hash using a provided salt.
   */
  static async hashWithSalt(data: string, salt: string): Promise<string> {
    return bcrypt.hash(data, salt);
  }
}
