import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
    bodyParser: false, // configureApp() installs json/urlencoded with explicit size caps
  });

  configureApp(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`PinnineCare API running on http://localhost:${port}/api`);
}
bootstrap();
