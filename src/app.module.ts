import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ConfigModule } from './config/config.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './module/auth/auth.module.js';
import { UsersModule } from './module/users/users.module.js';
import { LearningModule } from './module/learning/learning.module.js';
import { ConceptsModule } from './module/concepts/concepts.module.js';
import { CoursesModule } from './module/courses/courses.module.js';
import { ModulesModule } from './module/modules/modules.module.js';
import { LessonsModule } from './module/lessons/lessons.module.js';
import { AssessmentsModule } from './module/assessments/assessments.module.js';
import { LearnerModule } from './module/learner/learner.module.js';
import { EvidenceModule } from './module/evidence/evidence.module.js';
import { AgentsModule } from './module/agents/agents.module.js';
import { GenerationModule } from './module/generation/generation.module.js';
import { ContentModule } from './module/content/content.module.js';
import { MemoryModule } from './module/memory/memory.module.js';
import { JobsModule } from './module/jobs/jobs.module.js';
import { LlmModule } from './module/llm/llm.module.js';
import { PromptsModule } from './module/prompts/prompts.module.js';
import { GamificationModule } from './module/gamification/gamification.module.js';
import { UploadsModule } from './module/uploads/uploads.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from './config/config.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = {
          dev: configService.mongoUriDev,
          prod: configService.mongoUriProd,
          test: configService.mongoUriTest,
        }[configService.appMode];

        if (!mongoUri) {
          throw new Error(`MongoDB URI is not configured for ${configService.appMode} mode`);
        }

        return { uri: mongoUri };
      },
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'genielearn',
    }),
    AuthModule,
    UsersModule,
    LearningModule,
    ConceptsModule,
    CoursesModule,
    ModulesModule,
    LessonsModule,
    AssessmentsModule,
    LearnerModule,
    EvidenceModule,
    AgentsModule,
    GenerationModule,
    ContentModule,
    MemoryModule,
    JobsModule,
    LlmModule,
    PromptsModule,
    GamificationModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
