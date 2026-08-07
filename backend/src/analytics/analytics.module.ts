import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageVisit } from './analytics.entity';
import { ContactSubmission } from '../contact/contact.entity';
import { CareerApplication } from '../applications/application.entity';
import { Review } from '../reviews/review.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageVisit, ContactSubmission, CareerApplication, Review])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
