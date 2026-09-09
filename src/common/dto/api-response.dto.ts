import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard success response envelope.
 * The TransformInterceptor wraps all successful responses in this shape.
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true, description: 'Indicates the request was successful' })
  success: boolean;

  @ApiProperty({ example: 'Request successful', description: 'Human-readable message' })
  message: string;

  @ApiProperty({ description: 'Response payload', nullable: true })
  data: T;
}

/**
 * Standard error response envelope.
 * The ApiExceptionFilter formats all errors in this shape.
 */
export class ApiErrorResponseDto<T = any> {
  @ApiProperty({ example: false, description: 'Indicates the request failed' })
  success: boolean;

  @ApiProperty({ example: 'Validation failed', description: 'Human-readable error message' })
  message: string;

  @ApiProperty({ description: 'Detailed error information', nullable: true, example: null })
  errors: T;
}

/**
 * Generic success response DTO for Swagger schema generation.
 * Use with @ApiOkResponse / @ApiCreatedResponse to document the
 * actual { success, message, data } shape.
 */
export class SuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ description: 'Response data', nullable: true })
  data: any;
}

/**
 * Generic error response DTO for Swagger schema generation.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Resource not found' })
  message: string;

  @ApiProperty({ description: 'Error details', nullable: true, example: null })
  errors: any;
}
