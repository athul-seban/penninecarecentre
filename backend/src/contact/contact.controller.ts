import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from './contact.service';
import { ContactStatus } from './contact.entity';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact enquiry (public)' })
  submit(@Body() body: { name: string; email: string; phone?: string; subject?: string; message: string }) {
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
