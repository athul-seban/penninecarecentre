import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { CareersService } from './careers.service';

@Controller('careers')
export class CareersController {
  constructor(private careers: CareersService) {}

  @Get()
  findAll(@Query('open') open?: string) { return this.careers.findAll(open === 'true'); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.careers.findOne(id); }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers')
  @Post()
  create(@Body() body: any) { return this.careers.create(body); }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.careers.update(id, body); }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.careers.remove(id); }
}
