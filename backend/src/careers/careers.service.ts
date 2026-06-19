import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';

@Injectable()
export class CareersService {
  constructor(@InjectRepository(Job) private repo: Repository<Job>) {}

  findAll(openOnly = false) {
    return this.repo.find({
      where: openOnly ? { isOpen: true } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const job = await this.repo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  create(data: Partial<Job>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Job>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
