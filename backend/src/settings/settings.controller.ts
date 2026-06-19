import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

class BulkUpdateDto {
  @IsArray()
  updates: { key: string; value: string }[];
}

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all site settings grouped by category' })
  findAll() { return this.settings.findAll(); }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Bulk update settings (admin only)' })
  bulkUpdate(@Body() dto: BulkUpdateDto) { return this.settings.bulkUpdate(dto.updates); }
}
