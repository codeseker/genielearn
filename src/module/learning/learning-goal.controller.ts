import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import {
  type CreateGoalPayload,
  createGoalPayloadSchema,
  type UpdateGoalStatusPayload,
  updateGoalStatusPayloadSchema,
} from './dto/goal.dtos.js';
import { LearningGoalService } from './service/learning-goal.service.js';
import { type Request } from 'express';
import { Types } from 'mongoose';

@Controller('goals')
export class LearningGoalController {
  constructor(private readonly goalService: LearningGoalService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createGoalPayloadSchema))
  async create(@Body() payload: CreateGoalPayload, @Req() req: Request) {
    const userId = req.userId!;
    const id = new Types.ObjectId(userId);
    return this.goalService.create(id, payload);
  }

  @Get()
  async index(@Req() req: Request) {
    const userId = req.userId!;
    return this.goalService.findAllForUser(userId);
  }

  @Get(':id')
  async getSingleGoal(@Param('id') id: string) {
    return this.goalService.findById(id);
  }

  @Patch(':id/status')
  @UsePipes(new ZodValidationPipe(updateGoalStatusPayloadSchema))
  async updateGoal(
    @Param('id') id: string,
    @Body() payload: UpdateGoalStatusPayload,
  ) {
    return this.goalService.updateStatus(id, payload.status);
  }
}
