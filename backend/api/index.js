const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/bootstrap');

const server = express();
let bootstrapPromise;

async function bootstrapServer() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log'],
  });
  configureApp(nestApp);
  await nestApp.init();
  return server;
}

module.exports = async (req, res) => {
  if (!bootstrapPromise) bootstrapPromise = bootstrapServer();
  await bootstrapPromise;
  server(req, res);
};
