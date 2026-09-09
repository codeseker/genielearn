import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../config/ZodPipeline.js';
import {
  type CreateAssessmentPayload,
  type SubmitAssessmentAttemptPayload,
  submitAssessmentAttemptPayloadSchema,
  CreateAssessmentBodyDto,
  SubmitAttemptBodyDto,
  createAssessmentPayloadSchema,
} from './dtos/assessment.dto.js';
import { AssessmentService } from './service/assessment.service.js';
import { type Request } from 'express';

@ApiTags('Assessments')
@ApiBearerAuth('bearer-auth')
@Controller()
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('goals/:goalId/assessments')
  @ApiOperation({
    summary: 'Create a new assessment',
    description:
      'Creates an assessment for the specified learning goal. Questions are pulled from the stub question bank for the target concept and its transitive prerequisites.',
  })
  @ApiParam({
    name: 'goalId',
    description: 'Learning goal MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: CreateAssessmentBodyDto })
  @ApiCreatedResponse({
    description: 'Assessment created successfully',
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
    description: 'Target concept not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async create(
    @Param('goalId') goalId: string,
    @Body(new ZodValidationPipe(createAssessmentPayloadSchema))
    payload: CreateAssessmentPayload,
    @Req() req: Request,
  ) {
    console.log('BODY:', payload);
    console.log('TYPE:', typeof payload);
    const userId = req.userId!;
    return this.assessmentService.create(userId, goalId, payload);
  }

  @Get('assessments/:id')
  @ApiOperation({
    summary: 'Get an assessment by ID',
    description:
      'Returns assessment details with answers stripped from questions (never expose correct answers to the client).',
  })
  @ApiParam({
    name: 'id',
    description: 'Assessment MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Assessment details (answers stripped)',
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
    description: 'Assessment not found',
  })
  async findOne(@Param('id') id: string) {
    return this.assessmentService.findById(id, true);
  }

  @Post('assessments/:id/attempts')
  @ApiOperation({
    summary: 'Submit an assessment attempt',
    description:
      'Submits answers for an active assessment. The attempt is graded deterministically (MCQ), the assessment is marked COMPLETED, and the learner state is updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assessment MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: SubmitAttemptBodyDto })
  @ApiCreatedResponse({
    description: 'Attempt submitted and evaluated',
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
    description: 'Assessment not found',
  })
  @ApiBadRequestResponse({
    description: 'Assessment is not active or validation failed',
  })
  async submitAttempt(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(submitAssessmentAttemptPayloadSchema))
    payload: SubmitAssessmentAttemptPayload,
    @Req() req: Request,
  ) {
    const userId = req.userId!;
    return this.assessmentService.submitAttempt(id, userId, payload);
  }

  @Get('assessments/:id/attempts/:attemptId')
  @ApiOperation({
    summary: 'Get an assessment attempt by ID',
    description: 'Returns the details of a specific assessment attempt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assessment MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'attemptId',
    description: 'Assessment attempt MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Assessment attempt details',
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
    description: 'Assessment attempt not found',
  })
  async findAttempt(
    @Param('id') _id: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.assessmentService.findAttemptById(attemptId);
  }
}
