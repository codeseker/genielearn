import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError<T = any> extends HttpException {
  public readonly errors: T;

  constructor(
    message: string,
    errors: T = null as unknown as T,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ message, errors }, statusCode);
    this.errors = errors;
  }

  // Convenience static factories for common cases
  static badRequest<T>(message: string, errors?: T) {
    return new ApiError(message, errors, HttpStatus.BAD_REQUEST);
  }

  static notFound<T>(message: string, errors?: T) {
    return new ApiError(message, errors, HttpStatus.NOT_FOUND);
  }

  static unauthorized<T>(message: string, errors?: T) {
    return new ApiError(message, errors, HttpStatus.UNAUTHORIZED);
  }

  static forbidden<T>(message: string, errors?: T) {
    return new ApiError(message, errors, HttpStatus.FORBIDDEN);
  }

  static conflict<T>(message: string, errors?: T) {
    return new ApiError(message, errors, HttpStatus.CONFLICT);
  }

  static internal<T>(message: string, errors?: T) {
    return new ApiError(message, errors, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}