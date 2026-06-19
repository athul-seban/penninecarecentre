import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLog } from './error-log.entity';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');
const LOG_FILE = join(LOG_DIR, 'errors.log');

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

  findAll(limit = 100) {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  clear() {
    return this.repo.clear();
  }
}
