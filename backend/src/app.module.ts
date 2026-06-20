import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PagesModule } from './pages/pages.module';
import { MediaModule } from './media/media.module';
import { SettingsModule } from './settings/settings.module';
import { CareersModule } from './careers/careers.module';
import { TeamModule } from './team/team.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ContactModule } from './contact/contact.module';
import { ErrorLogModule } from './error-log/error-log.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres123'),
        database: config.get('DB_NAME', 'pinninecaredb'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
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
    ErrorLogModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
