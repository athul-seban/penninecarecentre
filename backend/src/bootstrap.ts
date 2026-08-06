import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { LoggingInterceptor } from './common/logging.interceptor';

export function configureApp(app: INestApplication): void {
  // Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, etc.).
  // CSP is left to the frontend apps that actually render HTML; this API
  // only serves JSON + the Swagger UI, and a default CSP breaks Swagger's
  // inline scripts/styles.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Explicit body size cap — this is a JSON CMS API, not a file-upload API
  // (uploads go through multer with their own limits below), so 2mb is
  // generous for page/content payloads while blocking oversized-body DoS
  // attempts from tying up memory/CPU.
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  // AllExceptionsFilter registered via APP_FILTER in ErrorLogModule for DI support

  const defaultOrigins = ['http://localhost:4200', 'http://localhost:4300'];
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: envOrigins && envOrigins.length > 0 ? envOrigins : defaultOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Building the OpenAPI doc walks every controller/DTO via reflection — real
  // CPU on every serverless cold start for a UI nobody hits in production.
  // Skip it there; set ENABLE_SWAGGER=true to opt back in without a code change.
  const swaggerEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true';
  if (swaggerEnabled) {
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
  }
}
