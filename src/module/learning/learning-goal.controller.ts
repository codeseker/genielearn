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

@Controller('goals')
export class LearningGoalController {
  constructor(private readonly goalService: LearningGoalService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createGoalPayloadSchema))
  async create(@Body() payload: CreateGoalPayload, @Req() req: any) {
    const userId = req.user.id; // adjust based on your auth guard's request shape
    return this.goalService.create(userId, payload);
  }

  @Get()
  async index(@Req() req: any) {
    const userId = req.user.id;
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
