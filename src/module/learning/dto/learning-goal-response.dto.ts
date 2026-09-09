import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Learning goal entity as returned by the API.
 */
export class LearningGoalDto {
  @ApiProperty({
    description: 'Unique goal identifier (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Owner user identifier (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Human-readable goal title',
    example: 'Learn TypeScript fundamentals',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Goal description / learner intent',
    example: 'Master TypeScript type system and generics',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Goal lifecycle status',
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED'],
    example: 'ACTIVE',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Initial/target difficulty level (1-5)',
    example: 3,
    nullable: true,
  })
  targetDifficulty: number | null;

  @ApiPropertyOptional({
    description: 'Goal-specific metadata',
    example: { source: 'user-input' },
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

/**
 * Course entity as returned alongside a learning goal.
 */
export class CourseDto {
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

/**
 * Response data when creating a learning goal.
 * Returns both the goal and its associated course shell.
 */
export class CreateGoalResponseDataDto {
  @ApiProperty({ type: LearningGoalDto, description: 'The created learning goal' })
  goal: LearningGoalDto;

  @ApiProperty({ type: CourseDto, description: 'The associated course shell' })
  course: CourseDto;
}
