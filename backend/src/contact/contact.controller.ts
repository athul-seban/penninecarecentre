import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 600_000 } }) // anti-spam/flood: 5 submissions/10min/IP
  @ApiOperation({ summary: 'Submit a contact enquiry (public)' })
  submit(@Body() body: SubmitContactDto) {
    return this.service.submit(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all contact submissions (admin)' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update submission status/notes (admin)' })
  update(@Param('id') id: string, @Body() body: { status: ContactStatus; notes?: string }) {
    return this.service.updateStatus(id, body.status, body.notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a contact submission (admin)' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
