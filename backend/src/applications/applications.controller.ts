import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IsDateString, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './application.entity';

class FindApplicationsQueryDto {
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
  @IsIn(['new', 'reviewing', 'shortlisted', 'rejected', 'archived'])
  status?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

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

class ReplyApplicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(5000)
  message: string;
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('applications')
  findAll(@Query() query: FindApplicationsQueryDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('applications')
  update(
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus; notes?: string },
  ) {
    return this.service.updateStatus(id, body.status, body.notes);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('applications')
  reply(@Param('id') id: string, @Body() body: ReplyApplicationDto) {
    return this.service.reply(id, body.subject, body.message);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('applications')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
