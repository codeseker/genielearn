import { Body, Controller, Get, Param, Patch, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import {
  type UpdateCourseStatusPayload,
  updateCourseStatusPayloadSchema,
} from './course.dto.js';
import { CourseService } from './course.service.js';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get(':id')
  async getCourse(@Param('id') id: string) {
    return this.courseService.findById(id);
  }

  @Get('by-goal/:goalId')
  async getCourseByGoal(@Param('goalId') goalId: string) {
    return this.courseService.findByGoalId(goalId);
  }

  @Patch(':id/status')
  @UsePipes(new ZodValidationPipe(updateCourseStatusPayloadSchema))
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateCourseStatusPayload,
  ) {
    return this.courseService.updateStatus(id, payload.status);
  }
}
