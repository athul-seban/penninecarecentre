import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ErrorLogService } from './error-log.service';

@ApiTags('error-logs')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('error-logs')
export class ErrorLogController {
  constructor(private service: ErrorLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent error logs (admin only)' })
  findAll(@Query('limit') limit?: string) {
    return this.service.findAll(limit ? parseInt(limit, 10) : 100);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all error logs (admin only)' })
  clear() {
    return this.service.clear();
  }
}
