import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './team-member.entity';

@Injectable()
export class TeamService {
  constructor(@InjectRepository(TeamMember) private repo: Repository<TeamMember>) {}

  findAll(activeOnly = false) {
    return this.repo.find({
      where: activeOnly ? { isActive: true } : {},
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const member = await this.repo.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  create(data: Partial<TeamMember>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<TeamMember>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
