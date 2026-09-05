import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { applyDateRange, parsePagination } from '../common/query.util';

export interface FindAuditLogQuery {
  page?: number;
  pageSize?: number;
  method?: string;
  from?: string;
  to?: string;
  q?: string;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog) private repo: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId?: string;
    userEmail?: string;
    method: string;
    path: string;
    details?: string;
    ip?: string;
  }): Promise<void> {
    const entry = this.repo.create(data);
    await this.repo.save(entry);
  }

  async findAll(query: FindAuditLogQuery = {}): Promise<PaginatedAuditLogs> {
    const { page, pageSize, skip } = parsePagination(query.page, query.pageSize, 50, 200);

    const qb = this.repo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC');
    applyDateRange(qb, 'l.createdAt', query.from, query.to);
    if (query.method) qb.andWhere('l.method = :method', { method: query.method });
    if (query.q) {
      qb.andWhere('(l.userEmail ILIKE :q OR l.path ILIKE :q)', { q: `%${query.q}%` });
    }

    const [items, total] = await qb.skip(skip).take(pageSize).getManyAndCount();
    return { items, total, page, pageSize };
  }

  clear() {
    return this.repo.clear();
  }
}
