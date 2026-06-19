import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';

const SEED_JOBS = [
  {
    title: 'Senior Care Worker',
    department: 'Care',
    type: 'Full-time',
    location: 'Glossop, Derbyshire',
    description: 'We are looking for an experienced and compassionate Senior Care Worker to join our dedicated team at Pennine Care Centre. You will support residents with daily living activities, help develop and implement care plans, and mentor junior staff members.',
    requirements: 'NVQ Level 3 in Health & Social Care (or equivalent)\nMinimum 2 years experience in a residential care setting\nExcellent communication and interpersonal skills\nAbility to work shifts including weekends\nEnhanced DBS check required',
    isOpen: true,
  },
  {
    title: 'Care Worker',
    department: 'Care',
    type: 'Full-time',
    location: 'Glossop, Derbyshire',
    description: 'Join our caring team and make a real difference to the lives of our residents. As a Care Worker you will assist with personal care, support social activities, and build warm, trusting relationships with residents and their families.',
    requirements: 'A caring and patient nature\nWillingness to complete NVQ Level 2/3 in Health & Social Care\nGood communication skills\nFlexible availability including evenings and weekends\nEnhanced DBS check required',
    isOpen: true,
  },
  {
    title: 'Night Care Worker',
    department: 'Care',
    type: 'Night shifts',
    location: 'Glossop, Derbyshire',
    description: 'We are seeking a reliable and experienced Night Care Worker to ensure the safety and wellbeing of our residents throughout the night. You will conduct regular checks, respond to calls, and provide support and reassurance as needed.',
    requirements: 'Previous experience in a care setting preferred\nAbility to work night shifts (typically 10pm – 7am)\nCalm, reassuring manner\nEnhanced DBS check required',
    isOpen: true,
  },
  {
    title: 'Activities Coordinator',
    department: 'Activities',
    type: 'Part-time',
    location: 'Glossop, Derbyshire',
    description: 'Help our residents live fulfilling, engaging lives by planning and running a diverse activities programme. From arts and crafts and gentle exercise to themed events and visiting entertainers, you will be at the heart of life at Pennine.',
    requirements: 'Passion for working with older people\nCreative and enthusiastic approach\nExperience in activity coordination, community work, or similar preferred\nGood organisational skills',
    isOpen: false,
  },
];

@Injectable()
export class CareersService implements OnModuleInit {
  constructor(@InjectRepository(Job) private repo: Repository<Job>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const j of SEED_JOBS) {
        await this.repo.save(this.repo.create(j));
      }
    }
  }

  findAll(openOnly = false) {
    return this.repo.find({
      where: openOnly ? { isOpen: true } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const job = await this.repo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  create(data: Partial<Job>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Job>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
