import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);


  const corsOrigin = configService.getOrThrow<string>('FRONTEND_URL');
  app.enableCors({
    origin: [corsOrigin],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(configService.getOrThrow<number>('PORT') ?? 4000, '0.0.0.0');
  logger.log(`🚀 NestJS Backend running on http://localhost:${configService.getOrThrow<number>('PORT') ?? 4000}`);
}
bootstrap();
