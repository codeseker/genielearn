import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentRun, AgentRunSchema } from './agent-run.model.js';
import { AgentDecision, AgentDecisionSchema } from './agent-decision.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AgentRun.name,
        schema: AgentRunSchema,
        collection: 'agent_runs',
      },
      {
        name: AgentDecision.name,
        schema: AgentDecisionSchema,
        collection: 'agent_decisions',
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class AgentsModule {}
