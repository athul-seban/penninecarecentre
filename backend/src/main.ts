import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4300'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Swagger API docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PinnineCare CMS API')
    .setDescription('REST API for Pennine Care Centre website & admin CMS')
    .setVersion('1.0')
    .addTag('auth', 'Authentication')
    .addTag('pages', 'Page content management')
    .addTag('team', 'Team member management')
    .addTag('careers', 'Job listing management')
    .addTag('reviews', 'Reviews management')
    .addTag('settings', 'Site settings')
    .addTag('media', 'Media/file uploads')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`PinnineCare API running on http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
