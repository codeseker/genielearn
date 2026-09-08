import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from './config/config.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(app.get(ConfigService).port);
  console.log("Server Started at PORT:", app.get(ConfigService).port);
  console.log("Database Connected Successfully.")
}
await bootstrap();
