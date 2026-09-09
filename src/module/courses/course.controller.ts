import { Body, Controller, Get, Param, Patch, UsePipes } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import {
  type UpdateCourseStatusPayload,
  updateCourseStatusPayloadSchema,
  UpdateCourseStatusBodyDto,
} from './course.dto.js';
import { CourseService } from './course.service.js';
@ApiTags('Courses')
@ApiBearerAuth('bearer-auth')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a course by ID',
    description: 'Returns a specific course by its MongoDB ObjectId.',
  })
  @ApiParam({ name: 'id', description: 'Course MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({
    description: 'Course details',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Request successful' } } },
        { properties: { data: { $ref: '#/components/schemas/CourseResponseDto' } } },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Course not found',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Course 507f1f77bcf86cd799439011 not found' } } },
      ],
    },
  })
  async getCourse(@Param('id') id: string) {
    return this.courseService.findById(id);
  }

  @Get('by-goal/:goalId')
  @ApiOperation({
    summary: 'Get a course by its associated learning goal ID',
    description: 'Returns the course linked to a specific learning goal. Each goal has at most one course.',
  })
  @ApiParam({ name: 'goalId', description: 'Learning goal MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({
    description: 'Course details',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Request successful' } } },
        { properties: { data: { $ref: '#/components/schemas/CourseResponseDto' } } },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Course not found for the given goal',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Course for goal 507f1f77bcf86cd799439011 not found' } } },
      ],
    },
  })
  async getCourseByGoal(@Param('goalId') goalId: string) {
    return this.courseService.findByGoalId(goalId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update a course status',
    description:
      'Changes the lifecycle status of a course. '
      + 'Note: COMPLETED status cannot be set directly — it must be driven by the learning agent.',
  })
  @ApiParam({ name: 'id', description: 'Course MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateCourseStatusBodyDto })
  @ApiOkResponse({
    description: 'Updated course',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Request successful' } } },
        { properties: { data: { $ref: '#/components/schemas/CourseResponseDto' } } },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Course not found',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Course 507f1f77bcf86cd799439011 not found' } } },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Cannot mark course as COMPLETED directly or validation failed',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Courses cannot be marked COMPLETED directly' } } },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(updateCourseStatusPayloadSchema))
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateCourseStatusPayload,
  ) {
    return this.courseService.updateStatus(id, payload.status);
  }
}
