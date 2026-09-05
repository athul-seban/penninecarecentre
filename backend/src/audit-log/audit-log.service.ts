import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

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

  findAll(limit = 200) {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  clear() {
    return this.repo.clear();
  }
}
