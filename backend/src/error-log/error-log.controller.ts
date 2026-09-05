import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { ErrorLogService } from './error-log.service';

class FindErrorLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;

  @IsOptional()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  method?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  q?: string;
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('errorLogs')
@Controller('error-logs')
export class ErrorLogController {
  constructor(private service: ErrorLogService) {}

  @Get()
  findAll(@Query() query: FindErrorLogQueryDto) {
    return this.service.findAll(query);
  }

  @Delete()
  clear() {
    return this.service.clear();
  }
}
