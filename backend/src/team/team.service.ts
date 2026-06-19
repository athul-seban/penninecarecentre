import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './team-member.entity';

const SEED_TEAM = [
  { name: 'Sarah Mitchell', role: 'Home Manager', bio: 'Sarah has over 20 years of experience in residential care management and holds a Level 5 Diploma in Leadership for Health and Social Care. She is dedicated to maintaining the highest standards of person-centred care at Pennine.', order: 1 },
  { name: 'Dr. Rajiv Patel', role: 'Visiting GP', bio: 'Dr. Patel visits Pennine Care Centre weekly and is always available for urgent consultations. He works closely with our care team to ensure all residents receive the best medical attention.', order: 2 },
  { name: 'Linda Thompson', role: 'Senior Care Worker', bio: 'Linda has been with Pennine for over 10 years and is a familiar, comforting face for residents and families. She leads our morning care team with warmth and professionalism.', order: 3 },
  { name: 'James Hargreaves', role: 'Activities Coordinator', bio: 'James brings creativity and enthusiasm to every activity session. From arts and crafts to musical afternoons, he ensures residents enjoy a rich and varied daily programme.', order: 4 },
  { name: 'Priya Sharma', role: 'Registered Nurse', bio: 'Priya is a qualified registered nurse with specialist experience in dementia care and falls prevention. She ensures all clinical care plans are up to date and evidence-based.', order: 5 },
  { name: 'Carol Davies', role: 'Head of Catering', bio: 'Carol oversees all meals at Pennine, ensuring menus are nutritious, varied, and cater to individual dietary needs. She sources fresh, local ingredients wherever possible.', order: 6 },
];

@Injectable()
export class TeamService implements OnModuleInit {
  constructor(@InjectRepository(TeamMember) private repo: Repository<TeamMember>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const m of SEED_TEAM) {
        await this.repo.save(this.repo.create({ ...m, isActive: true }));
      }
    }
  }

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
