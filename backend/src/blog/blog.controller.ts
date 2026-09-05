import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private blog: BlogService) {}

  @Get()
  findAll(@Query('published') published?: string) { return this.blog.findAll(published === 'true'); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.blog.findOne(id); }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('blog')
  @Post()
  create(@Body() body: any) { return this.blog.create(body); }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('blog')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.blog.update(id, body); }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('blog')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.blog.remove(id); }
}
