import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import * as fs from 'fs';
import * as path from 'path';

const ASSETS_DIR = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'images');

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  async upload(file: Express.Multer.File, _folder?: string, altText?: string): Promise<{ url: string }> {
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
    const filename = `${Date.now()}-${safeName}`;
    fs.writeFileSync(path.join(ASSETS_DIR, filename), file.buffer);

    const url = `/assets/images/${filename}`;
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';

    const media = this.repo.create({
      originalName: file.originalname,
      url,
      publicId: filename,
      resourceType,
      folder: 'local',
      altText,
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

  async updateAltText(id: string, altText: string): Promise<Media> {
    await this.repo.update(id, { altText });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    const filepath = path.join(ASSETS_DIR, media.publicId);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    await this.repo.delete(id);
  }
}
