import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  findAll(@Query('visible') visible?: string) { return this.reviews.findAll(visible === 'true'); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single review' })
  findOne(@Param('id') id: string) { return this.reviews.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create review (admin only)' })
  create(@Body() body: any) { return this.reviews.create(body); }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update review (admin only)' })
  update(@Param('id') id: string, @Body() body: any) { return this.reviews.update(id, body); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete review (admin only)' })
  remove(@Param('id') id: string) { return this.reviews.remove(id); }
}
