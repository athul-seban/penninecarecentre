import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CareersService } from './careers.service';

@Controller('careers')
export class CareersController {
  constructor(private careers: CareersService) {}

  @Get()
  findAll(@Query('open') open?: string) { return this.careers.findAll(open === 'true'); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.careers.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) { return this.careers.create(body); }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.careers.update(id, body); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.careers.remove(id); }
}
