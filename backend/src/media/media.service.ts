import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary.service';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private repo: Repository<Media>,
    private cloudinary: CloudinaryService,
  ) {}

  async upload(file: Express.Multer.File, folder?: string, altText?: string): Promise<Media> {
    const result = await this.cloudinary.uploadFile(file, folder);
    const media = this.repo.create({
      originalName: file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      folder: folder ?? 'pinninecaredb',
      altText,
    });
    return this.repo.save(media);
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
    await this.cloudinary.deleteFile(media.publicId);
    await this.repo.delete(id);
  }
}
