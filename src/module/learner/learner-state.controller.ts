import { Controller, Get, Param, Req } from '@nestjs/common';
import { LearnerStateService } from './service/learner-state.service.js';
import { type Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Learner')
@ApiBearerAuth('bearer-auth')
@Controller('goals')
export class LearnerStateController {
  constructor(private readonly learnerStateService: LearnerStateService) {}

  @Get(':goalId/learner-state')
  @ApiOperation({
    summary: 'Get learner state for a goal',
    description:
      'Returns the current learner state snapshot for the authenticated user and the specified learning goal.',
  })
  @ApiParam({
    name: 'goalId',
    description: 'Learning goal MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Learner state details',
    schema: {
      allOf: [
        {
          properties: {
            success: { example: true },
            message: { example: 'Request successful' },
          },
        },
        { properties: { data: { type: 'object' } } },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Learner state not found',
    schema: {
      allOf: [
        {
          properties: {
            success: { example: false },
            message: { example: 'Learner state not found' },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
  })
  async getLearnerState(
    @Param('goalId') goalId: string,
    @Req() req: Request,
  ) {
    const userId = req.userId!;
    return this.learnerStateService.findByUserAndGoal(userId, goalId);
  }
}
