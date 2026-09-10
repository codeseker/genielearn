import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '../../config/config.module.js';
import { ConfigService } from '../../config/config.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { GenerationJob, GenerationJobSchema } from './schema/generation-job.model.js';
import { GenerationJobService } from './service/generation-job.service.js';
import { GenerationProcessor } from './generation.processor.js';
import { GenerationController } from './generation.controller.js';
import { CurriculumAgentModule } from '../curriculum-agent/curriculum-agent.module.js';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'generation',
    }),
    MongooseModule.forFeature([
      {
        name: GenerationJob.name,
        schema: GenerationJobSchema,
        collection: 'generation_jobs',
      },
    ]),
    CurriculumAgentModule,
  ],
  controllers: [GenerationController],
  providers: [GenerationJobService, GenerationProcessor],
  exports: [GenerationJobService],
})
export class GenerationModule implements OnModuleInit {
  constructor(
    private readonly generationJobService: GenerationJobService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // The queue is registered via BullModule.registerQueue
    // The processor will automatically connect to it
  }
}
