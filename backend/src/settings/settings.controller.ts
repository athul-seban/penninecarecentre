import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { IsArray } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

class BulkUpdateDto {
  @IsArray()
  updates: { key: string; value: string }[];
}

@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  findAllPublic() { return this.settings.findAllPublic(); }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAll() { return this.settings.findAll(); }

  @UseGuards(JwtAuthGuard)
  @Put()
  bulkUpdate(@Body() dto: BulkUpdateDto) { return this.settings.bulkUpdate(dto.updates); }
}
