import { Controller, Post, Get, Body, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_REPORT_DAYS = 366;

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

  @Get('report')
  @UseGuards(JwtAuthGuard)
  getReport(@Query('from') from?: string, @Query('to') to?: string) {
    if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
      throw new BadRequestException('from and to are required as YYYY-MM-DD dates');
    }
    if (from > to) {
      throw new BadRequestException('from must not be after to');
    }
    const spanDays = (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000;
    if (spanDays > MAX_REPORT_DAYS) {
      throw new BadRequestException(`date range cannot exceed ${MAX_REPORT_DAYS} days`);
    }
    return this.service.getDateRangeReport(from, to);
  }
}
