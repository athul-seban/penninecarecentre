import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { AuditLogService } from './audit-log.service';

class FindAuditLogQueryDto {
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
@RequirePermission('activityLog')
@Controller('audit-logs')
export class AuditLogController {
  constructor(private service: AuditLogService) {}

  @Get()
  findAll(@Query() query: FindAuditLogQueryDto) {
    return this.service.findAll(query);
  }

  @Delete()
  clear() {
    return this.service.clear();
  }
}
