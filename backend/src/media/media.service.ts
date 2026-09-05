import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import * as fs from 'fs';
import * as path from 'path';
import { del } from '@vercel/blob';

const ASSETS_DIR = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'images');

// Own public origin, used to build the absolute URL for the raw-serving route
// below — mirrors the domains hardcoded in frontend/admin environment.ts.
function getPublicApiBase(): string {
  if (process.env.PUBLIC_API_URL) return process.env.PUBLIC_API_URL.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') return 'https://pinninecare-api.vercel.app';
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  async upload(file: Express.Multer.File, _folder?: string, altText?: string): Promise<{ url: string }> {
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';

    const media = this.repo.create({
      originalName: file.originalname,
      url: '',
      publicId: '',
      resourceType,
      folder: 'db',
      altText,
      data: file.buffer,
      mimeType: file.mimetype,
    });
    await this.repo.save(media);

    const url = `${getPublicApiBase()}/api/media/${media.id}/raw`;
    await this.repo.update(media.id, { url, publicId: media.id });

    return { url };
  }

  async findAll(folder?: string): Promise<Media[]> {
    const where = folder ? { folder } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async findRawById(id: string): Promise<{ data: Buffer; mimeType: string }> {
    const media = await this.repo.findOne({
      where: { id },
      select: { id: true, data: true, mimeType: true },
    });
    if (!media || !media.data) throw new NotFoundException('Media not found');
    return { data: media.data, mimeType: media.mimeType || 'application/octet-stream' };
  }

  async updateAltText(id: string, altText: string): Promise<Media> {
    await this.repo.update(id, { altText });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    if (media.folder === 'blob') {
      await del(media.publicId).catch(() => {});
    } else if (media.folder === 'local') {
      const filepath = path.join(ASSETS_DIR, media.publicId);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    // folder === 'db': the row itself holds the bytes, deleting it is enough.
    await this.repo.delete(id);
  }
}
