import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between, ObjectLiteral } from 'typeorm';
import { PageVisit } from './analytics.entity';
import { ContactSubmission } from '../contact/contact.entity';
import { CareerApplication } from '../applications/application.entity';
import { Review } from '../reviews/review.entity';

/** Masks the last IPv4 octet (or last 80 bits of an IPv6 address) so no individual visitor's full IP is retained — UK GDPR data minimisation. */
function anonymizeIp(ip?: string): string | undefined {
  if (!ip) return ip;
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
    return ip;
  }
  if (ip.includes(':')) {
    return ip.split(':').slice(0, 3).join(':') + '::';
  }
  return ip;
}

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
    const visit = this.repo.create({ ...data, ip: anonymizeIp(data.ip) });
    await this.repo.save(visit);
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, today, thisWeek, thisMonth, topPages, last7Days, devices, referrers] = await Promise.all([
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
      this.getDeviceBreakdown(),
      this.getTopReferrers(),
    ]);

    return { total, today, thisWeek, thisMonth, topPages, last7Days, devices, referrers };
  }

  private async getDeviceBreakdown(): Promise<{ device: string; count: number }[]> {
    const deviceExpr = `CASE
      WHEN v.userAgent IS NULL THEN 'Unknown'
      WHEN v.userAgent ~* 'bot|crawl|spider|slurp|facebookexternalhit' THEN 'Bot'
      WHEN v.userAgent ~* 'ipad|tablet' THEN 'Tablet'
      WHEN v.userAgent ~* 'mobile|iphone|android' THEN 'Mobile'
      ELSE 'Desktop'
    END`;
    const rows = await this.repo
      .createQueryBuilder('v')
      .select(deviceExpr, 'device')
      .addSelect('COUNT(*)', 'count')
      .groupBy(deviceExpr)
      .orderBy('count', 'DESC')
      .getRawMany();
    return rows.map(r => ({ device: r.device, count: parseInt(r.count, 10) }));
  }

  private async getTopReferrers(): Promise<{ source: string; count: number }[]> {
    const sourceExpr = `CASE
      WHEN v.referrer IS NULL OR v.referrer = '' THEN 'Direct'
      ELSE regexp_replace(regexp_replace(regexp_replace(v.referrer, '^https?://', ''), '^www\\.', ''), '/.*$', '')
    END`;
    const rows = await this.repo
      .createQueryBuilder('v')
      .select(sourceExpr, 'source')
      .addSelect('COUNT(*)', 'count')
      .groupBy(sourceExpr)
      .orderBy('count', 'DESC')
      .limit(8)
      .getRawMany();
    return rows.map(r => ({ source: r.source, count: parseInt(r.count, 10) }));
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

    days.reverse(); // latest date first

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
