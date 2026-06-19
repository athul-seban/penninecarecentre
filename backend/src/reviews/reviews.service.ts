import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review) private repo: Repository<Review>) {}

  findAll(visibleOnly = false) {
    return this.repo.find({
      where: visibleOnly ? { isVisible: true } : {},
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Review not found');
    return r;
  }

  create(data: Partial<Review>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Review>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
