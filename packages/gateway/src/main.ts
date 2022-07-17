import express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppExceptionsFilter } from './filter/app-exception.filter';

export async function bootstrap(){
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );
  app.useGlobalFilters(new AppExceptionsFilter());
  app.use(express.json());  
  await app.init();

  if (fs.existsSync('./tls.yaml')) {
    console.log("tls configuration exists");
    const yenv = require('yenv');
    const env = yenv('tls.yaml', { env: 'tls_server_config' });
    const key_file = env.key_file
    const cert_file = env.cert_file
    const httpsOptions = {  
      key: fs.readFileSync(key_file),
      cert: fs.readFileSync(cert_file),
    };
    https.createServer(httpsOptions, server).listen(3001);
  }else {
    http.createServer(server).listen(3000);
  }
  
}