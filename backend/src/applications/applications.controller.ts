import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './application.entity';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private service: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a job application (public)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cvFile', { storage: memoryStorage() }))
  submit(
    @Body() body: { fullName: string; email: string; phone?: string; position: string; coverLetter: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.submit(body, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all job applications (admin)' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update application status/notes (admin)' })
  update(
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus; notes?: string },
  ) {
    return this.service.updateStatus(id, body.status, body.notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a job application (admin)' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
