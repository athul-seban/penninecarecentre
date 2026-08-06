import {
  Controller, Get, Post, Delete, Param, Query,
  UseInterceptors, UploadedFile, Body, UseGuards, Patch, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import * as fs from 'fs';
import * as path from 'path';

const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024; // 50MB — covers hero images/videos

@ApiTags('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('media')
export class MediaController {
  constructor(private media: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to frontend/src/assets/images' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_MEDIA_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
          return cb(new BadRequestException('Only image or video files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('altText') altText?: string,
  ) { return this.media.upload(file, folder, altText); }

  @Get('local-assets')
  @ApiOperation({ summary: 'List image files from frontend/src/assets/images' })
  listLocalAssets(): string[] {
    const assetsDir = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'images');
    const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
    try {
      return fs.readdirSync(assetsDir)
        .filter(f => imageExts.has(path.extname(f).toLowerCase()))
        .sort()
        .map(f => `/assets/images/${f}`);
    } catch {
      return [];
    }
  }

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
  @ApiOperation({ summary: 'Delete a media file from disk and database' })
  remove(@Param('id') id: string) { return this.media.remove(id); }
}
