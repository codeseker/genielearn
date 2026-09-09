import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Course entity as returned by the API.
 */
export class CourseResponseDto {
  @ApiProperty({
    description: 'Unique course identifier (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Associated learning goal identifier',
    example: '507f1f77bcf86cd799439011',
  })
  goalId: string;

  @ApiProperty({
    description: 'Course title',
    example: 'Learn TypeScript fundamentals',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'A comprehensive course on TypeScript',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'URL-friendly course slug',
    example: 'learn-typescript-fundamentals',
  })
  slug: string;

  @ApiProperty({
    description: 'Course lifecycle status',
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'],
    example: 'ACTIVE',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Course-specific metadata',
    example: {},
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-09-08T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2026-09-08T12:00:00.000Z',
  })
  updatedAt: string;
}
