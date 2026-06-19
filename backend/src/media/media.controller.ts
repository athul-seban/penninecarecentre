import {
  Controller, Get, Post, Delete, Param, Query,
  UseInterceptors, UploadedFile, Body, UseGuards, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';

@ApiTags('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('media')
export class MediaController {
  constructor(private media: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('altText') altText?: string,
  ) { return this.media.upload(file, folder, altText); }

  @Get()
  @ApiOperation({ summary: 'List all uploaded media files' })
  findAll(@Query('folder') folder?: string) { return this.media.findAll(folder); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single media record' })
  findOne(@Param('id') id: string) { return this.media.findOne(id); }

  @Patch(':id/alt-text')
  @ApiOperation({ summary: 'Update alt text for a media file' })
  updateAltText(@Param('id') id: string, @Body('altText') altText: string) { return this.media.updateAltText(id, altText); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file from Cloudinary and database' })
  remove(@Param('id') id: string) { return this.media.remove(id); }
}
