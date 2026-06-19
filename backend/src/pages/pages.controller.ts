import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PagesService } from './pages.service';

@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private pages: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all page content entries' })
  findAll() { return this.pages.findAll(); }

  @Get(':pageKey')
  @ApiOperation({ summary: 'Get content for a specific page' })
  findOne(@Param('pageKey') pageKey: string) { return this.pages.findByKey(pageKey); }

  @UseGuards(JwtAuthGuard)
  @Put(':pageKey')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update page content (admin only)' })
  update(@Param('pageKey') pageKey: string, @Body() body: any) { return this.pages.update(pageKey, body); }
}
