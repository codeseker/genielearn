import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../common/exceptions/api-error.exception.js';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw ApiError.badRequest(
        'Validation failed',
        this.formatErrors(result.error),
      );
    }

    return result.data;
  }

  private formatErrors(error: ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!formatted[path]) formatted[path] = issue.message;
    }
    return formatted;
  }
}
