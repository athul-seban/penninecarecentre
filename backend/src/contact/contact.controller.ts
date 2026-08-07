import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from './contact.service';
import { ContactStatus } from './contact.entity';

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

@Controller('contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 600_000 } }) // anti-spam/flood: 5 submissions/10min/IP
  submit(@Body() body: SubmitContactDto) {
    return this.service.submit(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: { status: ContactStatus; notes?: string }) {
    return this.service.updateStatus(id, body.status, body.notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
