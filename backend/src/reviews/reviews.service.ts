import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

const SEED_REVIEWS = [
  { authorName: 'Kate T.', rating: 5, text: 'Mum was very resistant to giving up her independence, and the staff have bent over backwards to make this as smooth a transition as possible.', source: 'Google', order: 1 },
  { authorName: 'Nigel B.', rating: 5, text: 'My mum has been a resident for 6 weeks and I am very happy with the care she is receiving. Congratulations on your CQC rating of good.', source: 'Google', order: 2 },
  { authorName: 'Susan S.', rating: 5, text: 'I find everyone from the domestics to the carers very helpful. I know he is being cared for and that makes me feel happier.', source: 'Google', order: 3 },
  { authorName: 'Amber L.', rating: 5, text: 'The management and staff have been absolutely wonderful. They keep us updated constantly, and the level of care and empathy shown to my dad is exemplary. We could not have chosen a better place.', source: 'Google', order: 4 },
  { authorName: 'Mark W.', rating: 5, text: 'Excellent care home with fantastic, dedicated staff who genuinely care. The facilities are modern, clean, and very welcoming. My uncle is settled and very content here.', source: 'Google', order: 5 },
];

@Injectable()
export class ReviewsService implements OnModuleInit {
  constructor(@InjectRepository(Review) private repo: Repository<Review>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const r of SEED_REVIEWS) {
        await this.repo.save(this.repo.create({ ...r, isVisible: true }));
      }
    }
  }

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
