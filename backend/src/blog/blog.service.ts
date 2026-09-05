import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog-post.entity';

@Injectable()
export class BlogService {
  constructor(@InjectRepository(BlogPost) private repo: Repository<BlogPost>) {}

  findAll(publishedOnly = false) {
    return this.repo.find({
      where: publishedOnly ? { isPublished: true } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  create(data: Partial<BlogPost>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<BlogPost>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
