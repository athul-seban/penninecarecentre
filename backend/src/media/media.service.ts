import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import * as fs from 'fs';
import * as path from 'path';
import { put, del } from '@vercel/blob';

const ASSETS_DIR = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'images');
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  // Uploads go to Vercel Blob (public, persistent, CDN-served — same pattern
  // already used for CV uploads in applications.service.ts) when a token is
  // configured, falling back to writing into the frontend's local assets dir
  // for local dev without one. New rows no longer store bytes in Postgres —
  // only pre-existing folder: 'db' rows do, still served via GET :id/raw.
  async upload(file: Express.Multer.File, _folder?: string, altText?: string): Promise<{ url: string }> {
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';
    const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
    const filename = `${Date.now()}-${safeName}`;

    let url: string;
    let publicId: string;
    let folder: string;

    if (useBlob()) {
      const blob = await put(`media/${filename}`, file.buffer, {
        access: 'public',
        contentType: file.mimetype,
      });
      url = blob.url;
      publicId = blob.url;
      folder = 'blob';
    } else {
      if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
      fs.writeFileSync(path.join(ASSETS_DIR, filename), file.buffer);
      url = `/assets/images/${filename}`;
      publicId = filename;
      folder = 'local';
    }

    const media = this.repo.create({
      originalName: file.originalname,
      url,
      publicId,
      resourceType,
      folder,
      altText,
      data: null,
      mimeType: file.mimetype,
    });
    await this.repo.save(media);

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
