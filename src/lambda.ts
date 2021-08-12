// lambda.ts
import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const express = require('express');

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    nestApp.use(eventContext());
    await nestApp.init();
    cachedServer = createServer(expressApp);
  }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  cachedServer = await bootstrapServer();
  console.log('api request:: ', event, context);
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
