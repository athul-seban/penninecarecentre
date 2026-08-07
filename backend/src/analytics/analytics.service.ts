import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between, ObjectLiteral } from 'typeorm';
import { PageVisit } from './analytics.entity';
import { ContactSubmission } from '../contact/contact.entity';
import { CareerApplication } from '../applications/application.entity';
import { Review } from '../reviews/review.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PageVisit) private repo: Repository<PageVisit>,
    @InjectRepository(ContactSubmission) private contactRepo: Repository<ContactSubmission>,
    @InjectRepository(CareerApplication) private applicationRepo: Repository<CareerApplication>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  async track(data: {
    path: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
  }): Promise<void> {
    const visit = this.repo.create(data);
    await this.repo.save(visit);
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, today, thisWeek, thisMonth, topPages, last7Days] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { createdAt: MoreThanOrEqual(todayStart) } }),
      this.repo.count({ where: { createdAt: MoreThanOrEqual(weekStart) } }),
      this.repo.count({ where: { createdAt: MoreThanOrEqual(monthStart) } }),
      this.repo
        .createQueryBuilder('v')
        .select('v.path', 'path')
        .addSelect('COUNT(*)', 'count')
        .groupBy('v.path')
        .orderBy('count', 'DESC')
        .limit(8)
        .getRawMany()
        .then(rows => rows.map(r => ({ path: r.path, count: parseInt(r.count, 10) }))),
      this.getLast7Days(),
    ]);

    return { total, today, thisWeek, thisMonth, topPages, last7Days };
  }

  private async getLast7Days(): Promise<{ date: string; count: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const rows = await this.repo
      .createQueryBuilder('v')
      .select("TO_CHAR(v.createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('v.createdAt >= :since', { since })
      .groupBy("TO_CHAR(v.createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const map = new Map(rows.map(r => [r.date, parseInt(r.count, 10)]));
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: map.get(key) ?? 0 });
    }
    return days;
  }

  async getDateRangeReport(fromStr: string, toStr: string) {
    const from = new Date(`${fromStr}T00:00:00.000Z`);
    const to = new Date(`${toStr}T23:59:59.999Z`);

    const [visits, enquiries, applications, reviews, visitsByDay, enquiriesByDay, applicationsByDay, reviewsByDay] =
      await Promise.all([
        this.repo.count({ where: { createdAt: Between(from, to) } }),
        this.contactRepo.count({ where: { createdAt: Between(from, to) } }),
        this.applicationRepo.count({ where: { createdAt: Between(from, to) } }),
        this.reviewRepo.count({ where: { createdAt: Between(from, to) } }),
        this.groupByDay(this.repo, from, to),
        this.groupByDay(this.contactRepo, from, to),
        this.groupByDay(this.applicationRepo, from, to),
        this.groupByDay(this.reviewRepo, from, to),
      ]);

    const visitsMap = new Map(visitsByDay.map(r => [r.date, r.count]));
    const enquiriesMap = new Map(enquiriesByDay.map(r => [r.date, r.count]));
    const applicationsMap = new Map(applicationsByDay.map(r => [r.date, r.count]));
    const reviewsMap = new Map(reviewsByDay.map(r => [r.date, r.count]));

    const days: { date: string; visits: number; enquiries: number; applications: number; reviews: number }[] = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = cursor.toISOString().slice(0, 10);
      days.push({
        date: key,
        visits: visitsMap.get(key) ?? 0,
        enquiries: enquiriesMap.get(key) ?? 0,
        applications: applicationsMap.get(key) ?? 0,
        reviews: reviewsMap.get(key) ?? 0,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      from: fromStr,
      to: toStr,
      totals: { visits, enquiries, applications, reviews },
      days,
    };
  }

  private async groupByDay(
    repo: Repository<ObjectLiteral>,
    from: Date,
    to: Date,
  ): Promise<{ date: string; count: number }[]> {
    const rows = await repo
      .createQueryBuilder('t')
      .select("TO_CHAR(t.createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('t.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy("TO_CHAR(t.createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD')")
      .getRawMany();
    return rows.map(r => ({ date: r.date, count: parseInt(r.count, 10) }));
  }
}
