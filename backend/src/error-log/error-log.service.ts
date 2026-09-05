import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLog } from './error-log.entity';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { applyDateRange, parsePagination } from '../common/query.util';

const LOG_DIR = join(process.cwd(), 'logs');
const LOG_FILE = join(LOG_DIR, 'errors.log');

export interface FindErrorLogQuery {
  page?: number;
  pageSize?: number;
  method?: string;
  statusCode?: number;
  from?: string;
  to?: string;
  q?: string;
}

export interface PaginatedErrorLogs {
  items: ErrorLog[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectRepository(ErrorLog) private repo: Repository<ErrorLog>,
  ) {
    try { mkdirSync(LOG_DIR, { recursive: true }); } catch {}
  }

  async log(data: {
    method: string;
    path: string;
    statusCode: number;
    message: string;
    stack?: string;
    ip?: string;
  }): Promise<void> {
    const entry = this.repo.create(data);
    try {
      await this.repo.save(entry);
    } catch {
      this.writeToFile(data);
    }
  }

  private writeToFile(data: any): void {
    try {
      const line = `[${new Date().toISOString()}] ${data.statusCode} ${data.method} ${data.path} — ${data.message}\n${data.stack ?? ''}\n---\n`;
      appendFileSync(LOG_FILE, line, 'utf8');
    } catch {}
  }

  async findAll(query: FindErrorLogQuery = {}): Promise<PaginatedErrorLogs> {
    const { page, pageSize, skip } = parsePagination(query.page, query.pageSize, 50, 200);

    const qb = this.repo.createQueryBuilder('e').orderBy('e.createdAt', 'DESC');
    applyDateRange(qb, 'e.createdAt', query.from, query.to);
    if (query.method) qb.andWhere('e.method = :method', { method: query.method });
    if (query.statusCode) qb.andWhere('e.statusCode = :statusCode', { statusCode: query.statusCode });
    if (query.q) {
      qb.andWhere('(e.path ILIKE :q OR e.message ILIKE :q)', { q: `%${query.q}%` });
    }

    const [items, total] = await qb.skip(skip).take(pageSize).getManyAndCount();
    return { items, total, page, pageSize };
  }

  clear() {
    return this.repo.clear();
  }
}
