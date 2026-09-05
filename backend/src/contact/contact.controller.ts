import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { IsDateString, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { ContactService } from './contact.service';
import { ContactStatus } from './contact.entity';

class FindContactQueryDto {
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
  @IsIn(['new', 'read', 'replied', 'archived'])
  status?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

class SubmitContactDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MaxLength(5000)
  message: string;
}

class ReplyContactDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(5000)
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 600_000 } }) // anti-spam/flood: 5 submissions/10min/IP
  submit(@Body() body: SubmitContactDto) {
    return this.service.submit(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contact')
  findAll(@Query() query: FindContactQueryDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contact')
  update(@Param('id') id: string, @Body() body: { status: ContactStatus; notes?: string }) {
    return this.service.updateStatus(id, body.status, body.notes);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contact')
  reply(@Param('id') id: string, @Body() body: ReplyContactDto) {
    return this.service.reply(id, body.subject, body.message);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contact')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
