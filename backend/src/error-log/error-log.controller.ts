import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ErrorLogService } from './error-log.service';

@UseGuards(JwtAuthGuard)
@Controller('error-logs')
export class ErrorLogController {
  constructor(private service: ErrorLogService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.service.findAll(limit ? parseInt(limit, 10) : 100);
  }

  @Delete()
  clear() {
    return this.service.clear();
  }
}
