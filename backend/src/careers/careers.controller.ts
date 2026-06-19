import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CareersService } from './careers.service';

@ApiTags('careers')
@Controller('careers')
export class CareersController {
  constructor(private careers: CareersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all job listings' })
  @ApiQuery({ name: 'open', required: false, description: 'Pass true to return only open positions' })
  findAll(@Query('open') open?: string) { return this.careers.findAll(open === 'true'); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single job listing' })
  findOne(@Param('id') id: string) { return this.careers.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create job listing (admin only)' })
  create(@Body() body: any) { return this.careers.create(body); }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update job listing (admin only)' })
  update(@Param('id') id: string, @Body() body: any) { return this.careers.update(id, body); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete job listing (admin only)' })
  remove(@Param('id') id: string) { return this.careers.remove(id); }
}
