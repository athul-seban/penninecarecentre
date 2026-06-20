import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track a page visit (public)' })
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
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get analytics stats (admin only)' })
  getStats() {
    return this.service.getStats();
  }
}
