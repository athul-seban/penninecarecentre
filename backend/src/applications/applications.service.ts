import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerApplication, ApplicationStatus } from './application.entity';
import * as fs from 'fs';
import * as path from 'path';

const CV_DIR = path.join(process.cwd(), 'uploads', 'cv');

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(CareerApplication)
    private repo: Repository<CareerApplication>,
  ) {}

  async submit(data: Partial<CareerApplication>, file?: Express.Multer.File): Promise<CareerApplication> {
    let cvUrl: string | undefined;
    let cvPublicId: string | undefined;
    let cvOriginalName: string | undefined;

    if (file) {
      try {
        if (!fs.existsSync(CV_DIR)) fs.mkdirSync(CV_DIR, { recursive: true });
        const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
        const filename = `${Date.now()}-${safeName}`;
        fs.writeFileSync(path.join(CV_DIR, filename), file.buffer);
        cvUrl = `/uploads/cv/${filename}`;
        cvPublicId = filename;
        cvOriginalName = file.originalname;
      } catch {
        // proceed without CV if save fails
      }
    }

    const application = this.repo.create({ ...data, cvUrl, cvPublicId, cvOriginalName });
    return this.repo.save(application);
  }

  findAll(): Promise<CareerApplication[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<CareerApplication | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: ApplicationStatus, notes?: string): Promise<CareerApplication> {
    const app = await this.repo.findOneOrFail({ where: { id } });
    app.status = status;
    if (notes !== undefined) app.notes = notes;
    return this.repo.save(app);
  }

  async delete(id: string): Promise<void> {
    const app = await this.repo.findOne({ where: { id } });
    if (app?.cvPublicId) {
      const filepath = path.join(CV_DIR, app.cvPublicId);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await this.repo.delete(id);
  }
}
