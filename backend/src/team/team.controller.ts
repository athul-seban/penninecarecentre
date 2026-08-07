import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private team: TeamService) {}

  @Get()
  findAll(@Query('active') active?: string) { return this.team.findAll(active === 'true'); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.team.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) { return this.team.create(body); }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.team.update(id, body); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.team.remove(id); }
}
