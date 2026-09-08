import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from './config/config.service.js';
import { TransformInterceptor } from './common/filters/api-response-transformer.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(app.get(ConfigService).port);
  console.log("Server Started at PORT:", app.get(ConfigService).port);
  console.log("Database Connected Successfully.")
}
await bootstrap();
