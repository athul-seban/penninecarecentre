import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamService } from './team.service';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private team: TeamService) {}

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @ApiQuery({ name: 'active', required: false, description: 'Pass true to return only active members' })
  findAll(@Query('active') active?: string) { return this.team.findAll(active === 'true'); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single team member' })
  findOne(@Param('id') id: string) { return this.team.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create team member (admin only)' })
  create(@Body() body: any) { return this.team.create(body); }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update team member (admin only)' })
  update(@Param('id') id: string, @Body() body: any) { return this.team.update(id, body); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete team member (admin only)' })
  remove(@Param('id') id: string) { return this.team.remove(id); }
}
