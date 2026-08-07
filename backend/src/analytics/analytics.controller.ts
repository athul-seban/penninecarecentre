import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Post('track')
  async track(
    @Body() body: { path: string; referrer?: string },
    @Req() req: any,
  ): Promise<void> {
    await this.service.track({
      path: body.path,
      referrer: body.referrer,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.service.getStats();
  }
}
