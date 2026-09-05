import {
  Controller, Get, Post, Delete, Param, Query,
  UseInterceptors, UploadedFile, Body, UseGuards, Patch, BadRequestException,
  StreamableFile, Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import * as fs from 'fs';
import * as path from 'path';

const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024; // 50MB — covers hero images/videos

@Controller('media')
export class MediaController {
  constructor(private media: MediaService) {}

  // Public: this is the actual <img src>/<video src> the public site and admin
  // both load images from, so it must not require an auth token. Helmet's
  // default Cross-Origin-Resource-Policy: same-origin would otherwise block
  // the frontend/admin apps (different origins) from loading it.
  @Get(':id/raw')
  @SkipThrottle()
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  async serveRaw(@Param('id') id: string): Promise<StreamableFile> {
    const { data, mimeType } = await this.media.findRawById(id);
    return new StreamableFile(data, { type: mimeType });
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
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

  @UseGuards(JwtAuthGuard)
  @Get('local-assets')
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

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('folder') folder?: string) { return this.media.findAll(folder); }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) { return this.media.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/alt-text')
  updateAltText(@Param('id') id: string, @Body('altText') altText: string) { return this.media.updateAltText(id, altText); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.media.remove(id); }
}
