import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './application.entity';

const ALLOWED_CV_MIMETYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

class SubmitApplicationDto {
  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsString()
  @MaxLength(150)
  position: string;

  @IsString()
  @MaxLength(5000)
  coverLetter: string;
}

@Controller('applications')
export class ApplicationsController {
  constructor(private service: ApplicationsService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 600_000 } }) // anti-spam/flood: 5 submissions/10min/IP
  @UseInterceptors(
    FileInterceptor('cvFile', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_CV_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_CV_MIMETYPES.has(file.mimetype)) {
          return cb(new BadRequestException('CV must be a PDF or Word document'), false);
        }
        cb(null, true);
      },
    }),
  )
  submit(
    @Body() body: SubmitApplicationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.submit(body, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus; notes?: string },
  ) {
    return this.service.updateStatus(id, body.status, body.notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
