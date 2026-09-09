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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import {
  type CreateGoalPayload,
  createGoalPayloadSchema,
  type UpdateGoalStatusPayload,
  updateGoalStatusPayloadSchema,
  CreateGoalBodyDto,
  UpdateGoalStatusBodyDto,
} from './dto/goal.dtos.js';
import { LearningGoalService } from './service/learning-goal.service.js';
import { type Request } from 'express';
import { Types } from 'mongoose';
@ApiTags('Learning Goals')
@ApiBearerAuth('bearer-auth')
@Controller('goals')
export class LearningGoalController {
  constructor(private readonly goalService: LearningGoalService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new learning goal',
    description:
      'Creates a new adaptive learning goal for the authenticated user. '
      + 'An empty course shell is automatically created and associated with the goal.',
  })
  @ApiBody({ type: CreateGoalBodyDto })
  @ApiCreatedResponse({
    description: 'Learning goal and associated course created successfully',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Request successful' } } },
        { properties: { data: { $ref: '#/components/schemas/CreateGoalResponseDataDto' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Unauthorized Access' } } },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Validation failed' } } },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(createGoalPayloadSchema))
  async create(@Body() payload: CreateGoalPayload, @Req() req: Request) {
    const userId = req.userId!;
    const id = new Types.ObjectId(userId);
    return this.goalService.create(id, payload);
  }

  @Get()
  @ApiOperation({
    summary: 'List all learning goals for the authenticated user',
    description: 'Returns all learning goals owned by the current user.',
  })
  @ApiOkResponse({
    description: 'List of learning goals',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Request successful' } } },
        { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/LearningGoalDto' } } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Unauthorized Access' } } },
      ],
    },
  })
  async index(@Req() req: Request) {
    const userId = req.userId!;
    return this.goalService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single learning goal by ID',
    description: 'Returns a specific learning goal. No ownership restriction is enforced.',
  })
  @ApiParam({ name: 'id', description: 'Learning goal MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({
    description: 'Learning goal details',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Request successful' } } },
        { properties: { data: { $ref: '#/components/schemas/LearningGoalDto' } } },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Learning goal not found',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Learning goal 507f1f77bcf86cd799439011 not found' } } },
      ],
    },
  })
  async getSingleGoal(@Param('id') id: string) {
    return this.goalService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update a learning goal status',
    description:
      'Changes the lifecycle status of a learning goal. '
      + 'Note: COMPLETED status cannot be set directly — it must be determined by the learning agent.',
  })
  @ApiParam({ name: 'id', description: 'Learning goal MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateGoalStatusBodyDto })
  @ApiOkResponse({
    description: 'Updated learning goal',
    schema: {
      allOf: [
        { properties: { success: { example: true }, message: { example: 'Request successful' } } },
        { properties: { data: { $ref: '#/components/schemas/LearningGoalDto' } } },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Learning goal not found',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Learning goal 507f1f77bcf86cd799439011 not found' } } },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Cannot mark goal as COMPLETED directly or validation failed',
    schema: {
      allOf: [
        { properties: { success: { example: false }, message: { example: 'Goals cannot be marked COMPLETED directly' } } },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(updateGoalStatusPayloadSchema))
  async updateGoal(
    @Param('id') id: string,
    @Body() payload: UpdateGoalStatusPayload,
  ) {
    return this.goalService.updateStatus(id, payload.status);
  }
}
