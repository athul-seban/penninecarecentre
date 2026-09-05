import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { parsePagination } from '../common/query.util';

export interface FindBlogPostsQuery {
  page?: number;
  pageSize?: number;
  status?: 'published' | 'draft';
  q?: string;
}

export interface PaginatedBlogPosts {
  items: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  counts: { all: number; published: number; draft: number };
}

// Inserted in this order (oldest first) — findAll() sorts by createdAt DESC,
// so the last entry here is the one that lands as the blog's featured/hero post.
const SEED_POSTS = [
  {
    title: 'Welcome to Our New Blog',
    excerpt: 'We are excited to share news and updates from Pennine Care Centre.',
    content: 'This is our first blog post. Here we will share stories, activities, and updates from daily life at the home.',
    featuredImage: '/assets/images/pennine-suite-hero.png',
  },
  {
    title: 'Behind the Scenes: Freshly Prepared Meals at Pennine Care Centre',
    excerpt: 'Good food is a big part of daily life at Pennine — here is a look at how our kitchen team plans meals around individual tastes and needs.',
    content: 'Mealtimes are one of the highlights of the day for many of our residents, and our kitchen team takes real pride in getting them right.\n\nEvery meal is freshly prepared on site, with menus planned around individual tastes, preferences, and any dietary or medical requirements. Residents are involved in menu planning too, with regular taste-testing sessions helping shape what ends up on the weekly menu.\n\nWhether it is a traditional Sunday roast or a lighter option for someone with specific dietary needs, our aim is always the same: food that is nutritious, enjoyable, and feels like a proper home-cooked meal.',
    featuredImage: '/assets/images/life-nutrition-dining.png',
  },
  {
    title: 'A Day Out in the Peak District',
    excerpt: 'Residents recently enjoyed a community outing into the surrounding Peak District countryside — here is how the day went.',
    content: 'One of the real joys of being based in Glossop is having the Peak District National Park right on our doorstep, and last month a group of residents made the most of it with a community outing.\n\nThe group enjoyed a scenic drive through the surrounding hills, followed by tea and cake at a local café, before returning home in time for the afternoon activities session. For many residents, outings like these are a wonderful chance to get out and about, enjoy some fresh air, and simply see a different view for the day.\n\nWe run outings like this regularly, weather and availability permitting — ask a member of our team if you would like to know what is coming up next.',
    featuredImage: '/assets/images/life-community-outings.png',
  },
  {
    title: 'Understanding Dementia Care: How We Support Residents Every Day',
    excerpt: 'A look at the person-centred approach our care team uses to support residents living with dementia, and why familiar routines matter so much.',
    content: 'Caring for someone living with dementia is about far more than routine tasks — it is about really knowing the person behind the diagnosis.\n\nOur care team builds a detailed picture of each resident\'s history, preferences, and routines, so that daily support feels familiar and reassuring rather than clinical. Simple things — a favourite chair, a well-loved piece of music, a consistent morning routine — can make a huge difference to someone\'s sense of calm and identity.\n\nWe also work closely with families throughout the journey, since they often hold the key details that help us provide truly person-centred care. If you would like to know more about our approach to dementia care, our team is always happy to talk this through with you.',
    featuredImage: '/assets/images/service-dementia-care.png',
  },
  {
    title: 'Our Autumn Activities Programme Is Here',
    excerpt: 'From seasonal crafts to gentle garden walks, our activities team has put together a warm and welcoming programme for the months ahead.',
    content: 'As the leaves begin to turn, our activities team has launched a brand new autumn programme designed to keep residents engaged, active, and connected throughout the season.\n\nEach week brings a mix of seasonal crafts, music and reminiscence sessions, gentle exercise classes, and short walks around our secure gardens to enjoy the crisp autumn air. We have also introduced a weekly baking afternoon, filling the home with the smell of fresh scones and flapjacks.\n\nFamilies are always welcome to join a session during a visit — just speak to a member of the activities team to find out what is happening during your next visit.',
    featuredImage: '/assets/images/life-activities.png',
  },
];

@Injectable()
export class BlogService implements OnModuleInit {
  constructor(@InjectRepository(BlogPost) private repo: Repository<BlogPost>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const p of SEED_POSTS) {
        await this.repo.save(this.repo.create({ ...p, isPublished: true }));
      }
    }
  }

  /** Public listing — always published-only, regardless of caller-supplied query params. */
  findAllPublished() {
    return this.repo.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAdmin(query: FindBlogPostsQuery = {}): Promise<PaginatedBlogPosts> {
    const { page, pageSize, skip } = parsePagination(query.page, query.pageSize);

    const qb = this.repo.createQueryBuilder('b').orderBy('b.createdAt', 'DESC');
    if (query.status === 'published') qb.andWhere('b.isPublished = true');
    if (query.status === 'draft') qb.andWhere('b.isPublished = false');
    if (query.q) qb.andWhere('b.title ILIKE :q', { q: `%${query.q}%` });

    const [items, total] = await qb.skip(skip).take(pageSize).getManyAndCount();
    const counts = await this.getStatusCounts(query.q);

    return { items, total, page, pageSize, counts };
  }

  private async getStatusCounts(q?: string): Promise<{ all: number; published: number; draft: number }> {
    const base = () => {
      const qb = this.repo.createQueryBuilder('b');
      if (q) qb.andWhere('b.title ILIKE :q', { q: `%${q}%` });
      return qb;
    };
    const all = await base().getCount();
    const published = await base().andWhere('b.isPublished = true').getCount();
    return { all, published, draft: all - published };
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
