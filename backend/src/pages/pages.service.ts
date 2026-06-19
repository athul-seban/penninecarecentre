import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent } from './page-content.entity';

const DEFAULT_PAGES = [
  { pageKey: 'home', title: 'Home', metaTitle: 'Pennine Care Centre', metaDescription: 'Premium residential care in Glossop, Derbyshire.', sections: {} },
  { pageKey: 'pennine-suite', title: 'Pennine Suite', metaTitle: 'Pennine Suite | Pennine Care Centre', metaDescription: '', sections: {} },
  { pageKey: 'moorland-suite', title: 'Moorland Suite', metaTitle: 'Moorland Suite | Pennine Care Centre', metaDescription: '', sections: {} },
  { pageKey: 'services', title: 'Our Services', metaTitle: 'Care Services | Pennine Care Centre', metaDescription: '', sections: {} },
  { pageKey: 'life-at-pennine', title: 'Life at Pennine', metaTitle: 'Life at Pennine | Pennine Care Centre', metaDescription: '', sections: {} },
  { pageKey: 'team', title: 'Our Team', metaTitle: 'Our Team | Pennine Care Centre', metaDescription: '', sections: {} },
  { pageKey: 'contact', title: 'Contact', metaTitle: 'Contact Us | Pennine Care Centre', metaDescription: '', sections: {} },
  { pageKey: 'careers', title: 'Careers', metaTitle: 'Careers | Pennine Care Centre', metaDescription: '', sections: {} },
];

@Injectable()
export class PagesService implements OnModuleInit {
  constructor(@InjectRepository(PageContent) private repo: Repository<PageContent>) {}

  async onModuleInit() {
    for (const p of DEFAULT_PAGES) {
      const exists = await this.repo.findOne({ where: { pageKey: p.pageKey } });
      if (!exists) await this.repo.save(this.repo.create(p));
    }
  }

  findAll() {
    return this.repo.find({ order: { pageKey: 'ASC' } });
  }

  async findByKey(pageKey: string) {
    const page = await this.repo.findOne({ where: { pageKey } });
    if (!page) throw new NotFoundException(`Page '${pageKey}' not found`);
    return page;
  }

  async update(pageKey: string, data: Partial<PageContent>) {
    const page = await this.findByKey(pageKey);
    await this.repo.update(page.id, data);
    return this.findByKey(pageKey);
  }
}
