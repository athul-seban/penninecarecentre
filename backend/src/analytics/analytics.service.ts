import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { PageVisit } from './analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PageVisit) private repo: Repository<PageVisit>,
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
}
