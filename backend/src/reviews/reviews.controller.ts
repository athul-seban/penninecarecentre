import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  findAll(@Query('visible') visible?: string) { return this.reviews.findAll(visible === 'true'); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.reviews.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) { return this.reviews.create(body); }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.reviews.update(id, body); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.reviews.remove(id); }
}
