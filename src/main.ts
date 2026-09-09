import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from './config/config.service.js';
import { TransformInterceptor } from './common/filters/api-response-transformer.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import {
  ApiResponseDto,
  ApiErrorResponseDto,
} from './common/dto/api-response.dto.js';
import {
  AuthUserDataDto,
  TokenPairDto,
} from './module/auth/dtos/auth-response.dto.js';
import {
  LearningGoalDto,
  CourseDto,
  CreateGoalResponseDataDto,
} from './module/learning/dto/learning-goal-response.dto.js';
import { CourseResponseDto } from './module/courses/course-response.dto.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  // --- Swagger / OpenAPI configuration ---
  const config = new DocumentBuilder()
    .setTitle('GenieLearn API')
    .setDescription(
      'GenieLearn adaptive learning platform API. '
      + 'Provides endpoints for user authentication, learning goals, courses, '
      + 'concepts, assessments, and AI-powered content generation.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Enter your JWT access token. Most endpoints require authentication.',
      },
      'bearer-auth',
    )
    .addTag('Auth', 'User registration, login, logout, and token management')
    .addTag('Learning Goals', 'Create and manage adaptive learning goals')
    .addTag('Courses', 'Retrieve and manage courses associated with learning goals')
    .addTag('App', 'Application health and root endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      ApiResponseDto,
      ApiErrorResponseDto,
      AuthUserDataDto,
      TokenPairDto,
      LearningGoalDto,
      CourseDto,
      CreateGoalResponseDataDto,
      CourseResponseDto,
    ],
  });

  SwaggerModule.setup('docs', app, document);

  await app.listen(app.get(ConfigService).port);
  console.log("Server Started at PORT:", app.get(ConfigService).port);
  console.log("Database Connected Successfully.");
  console.log("Swagger docs available at /docs");
}
await bootstrap();
