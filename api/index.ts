import 'reflect-metadata';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AppModule } from '../src/app.module';

const expressServer = express();
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressServer),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  })();

  return initPromise;
}

export default async function handler(req: express.Request, res: express.Response) {
  await ensureInitialized();
  return expressServer(req, res);
}
