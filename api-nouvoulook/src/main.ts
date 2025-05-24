import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Ajout du middleware pour logger le corps de la requête
  app.use(express.json({ limit: '50mb' }));
  app.use((req, res, next) => {
    if (req.method === 'PATCH' || req.method === 'POST') {
      console.log('Corps de la requête:', JSON.stringify(req.body, null, 2));
    }
    next();
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  const configService = app.get(ConfigService);
  console.log('Static assets path:', join(process.cwd(), 'public', 'assets'));
  app.use('/assets', express.static(join(process.cwd(), 'public', 'assets'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.pdf')) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    }
  }));
  await app.listen(configService.get('PORT', 3001));
}
bootstrap();