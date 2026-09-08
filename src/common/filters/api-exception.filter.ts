import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiError } from '../exceptions/api-error.exception.js';
import { ApiErrorResponse } from '../interfaces/api-response.interface.js';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = null;

    if (exception instanceof ApiError) {
      statusCode = exception.getStatus();
      message = exception.message;
      errors = exception.errors;
    } else if (exception instanceof HttpException) {
      // Catches Nest's built-in exceptions (e.g. thrown by guards/framework)
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? message;
      errors = typeof res === 'object' ? (res as any).errors ?? null : null;
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      errors,
    };

    response.status(statusCode).json(errorResponse);
  }
}