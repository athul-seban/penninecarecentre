import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PagesModule } from './pages/pages.module';
import { MediaModule } from './media/media.module';
import { SettingsModule } from './settings/settings.module';
import { CareersModule } from './careers/careers.module';
import { TeamModule } from './team/team.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ContactModule } from './contact/contact.module';
import { ApplicationsModule } from './applications/applications.module';
import { ErrorLogModule } from './error-log/error-log.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        // Default limit for all routes: 100 requests / minute / IP.
        // Prevents a single client from hammering the API and exhausting
        // server/DB resources. Individual routes can tighten this further
        // with @Throttle(...) (see auth/contact/applications controllers).
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        // DATABASE_URL is what we document/use everywhere; POSTGRES_URL /
        // POSTGRES_PRISMA_URL are the names Vercel's own Storage-tab Postgres
        // integration has used for the auto-injected connection string.
        const databaseUrl =
          config.get<string>('DATABASE_URL') ||
          config.get<string>('POSTGRES_URL') ||
          config.get<string>('POSTGRES_PRISMA_URL');
        const base = databaseUrl
          ? {
              url: databaseUrl,
              ssl: { rejectUnauthorized: false },
              // Serverless: every concurrent function instance opens its own
              // pool. Keep it tiny so a burst of cold starts can't exhaust
              // Neon's free-tier connection cap — pair with Neon's pooled
              // (pgbouncer) connection string for the actual DATABASE_URL.
              extra: { max: 1 },
            }
          : {
              host: config.get('DB_HOST', 'localhost'),
              port: config.get<number>('DB_PORT', 5432),
              username: config.get('DB_USERNAME', 'postgres'),
              password: config.get('DB_PASSWORD', 'postgres123'),
              database: config.get('DB_NAME', 'pinninecaredb'),
            };
        return {
          type: 'postgres',
          ...base,
          autoLoadEntities: true,
          synchronize: config.get('DB_FORCE_SYNC') === 'true' || config.get('NODE_ENV') !== 'production',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PagesModule,
    MediaModule,
    SettingsModule,
    CareersModule,
    TeamModule,
    ReviewsModule,
    ContactModule,
    ApplicationsModule,
    ErrorLogModule,
    AnalyticsModule,
    BlogModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
