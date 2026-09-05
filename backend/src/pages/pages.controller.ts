import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private pages: PagesService) {}

  @Get()
  findAll() { return this.pages.findAll(); }

  @Get(':pageKey')
  findOne(@Param('pageKey') pageKey: string) { return this.pages.findByKey(pageKey); }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('pages')
  @Put(':pageKey')
  update(@Param('pageKey') pageKey: string, @Body() body: any) { return this.pages.update(pageKey, body); }
}
