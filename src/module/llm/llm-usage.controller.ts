import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LlmUsageService } from './service/llm-usage.service.js';

@Controller('internal/llm-usage')
export class LlmUsageController {
  constructor(private readonly llmUsageService: LlmUsageService) {}

  @Get('goals/:goalId/total-cost')
  @HttpCode(HttpStatus.OK)
  async getTotalCostForGoal(@Param('goalId') goalId: string): Promise<{ goalId: string; totalCost: number }> {
    const totalCost = await this.llmUsageService.getTotalCostForGoal(goalId);
    return { goalId, totalCost };
  }

  @Get('goals/:goalId/breakdown')
  @HttpCode(HttpStatus.OK)
  async getUsageBreakdown(
    @Param('goalId') goalId: string,
  ): Promise<{
    goalId: string;
    breakdown: { agent: string; totalCost: number; totalInputTokens: number; totalOutputTokens: number; callCount: number }[];
  }> {
    const breakdown = await this.llmUsageService.getUsageBreakdownByAgent(goalId);
    return { goalId, breakdown };
  }
}
