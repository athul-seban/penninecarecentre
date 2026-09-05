import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { BlogService } from './blog.service';

class FindBlogPostsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(['published', 'draft'])
  status?: 'published' | 'draft';

  @IsOptional()
  @IsString()
  @MaxLength(150)
  q?: string;
}

@Controller('blog')
export class BlogController {
  constructor(private blog: BlogService) {}

  // Public — used by the frontend blog list/detail pages. Always published-only.
  @Get()
  findAll() { return this.blog.findAllPublished(); }

  // Admin — paginated + filterable, used by the admin blog manager.
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('blog')
  @Get('admin')
  findAllAdmin(@Query() query: FindBlogPostsQueryDto) { return this.blog.findAllAdmin(query); }

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
