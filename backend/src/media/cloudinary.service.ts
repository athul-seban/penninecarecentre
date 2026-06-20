import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  private checkConfig() {
    const name = this.config.get('CLOUDINARY_CLOUD_NAME');
    const key = this.config.get('CLOUDINARY_API_KEY');
    const secret = this.config.get('CLOUDINARY_API_SECRET');
    if (!name || name === 'your_cloud_name' || !key || key === 'your_api_key' || !secret || secret === 'your_api_secret') {
      throw new InternalServerErrorException(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env',
      );
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'pinninecaredb'): Promise<UploadApiResponse> {
    this.checkConfig();
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(new InternalServerErrorException(`Cloudinary upload failed: ${error.message}`));
          resolve(result!);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async listFiles(folder = 'pinninecaredb') {
    const result = await cloudinary.api.resources({ type: 'upload', prefix: folder });
    return result.resources;
  }
}
