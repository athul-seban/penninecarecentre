import { INestApplication, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { LoggingInterceptor } from './common/logging.interceptor';

export function configureApp(app: INestApplication): void {
  // Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, etc.).
  // CSP is left to the frontend apps that actually render HTML; this API
  // only serves JSON.
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
}
