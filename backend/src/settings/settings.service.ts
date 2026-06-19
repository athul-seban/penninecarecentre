import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';

const DEFAULT_SETTINGS = [
  { key: 'site.phone', value: '01457 862466', group: 'contact', label: 'Phone Number' },
  { key: 'site.email', value: 'Admin@nyms-services.com', group: 'contact', label: 'Email Address' },
  { key: 'site.address', value: 'Pennine Care Centre, Glossop, Derbyshire', group: 'contact', label: 'Address' },
  { key: 'site.whatsapp', value: '441457862466', group: 'contact', label: 'WhatsApp Number' },
  { key: 'hero.headline', value: 'A Place to Call Home', group: 'hero', label: 'Hero Headline' },
  { key: 'hero.subtext', value: 'Premium residential care in the heart of Glossop', group: 'hero', label: 'Hero Subtext' },
  { key: 'announcement.text', value: 'Rated Outstanding by CQC', group: 'announcement', label: 'Announcement Text' },
  { key: 'announcement.active', value: 'true', group: 'announcement', label: 'Show Announcement' },
  { key: 'site.cqcRating', value: 'Outstanding', group: 'seo', label: 'CQC Rating' },
  { key: 'site.googleMapsUrl', value: '', group: 'contact', label: 'Google Maps Embed URL' },
  { key: 'site.theme', value: 'classic', group: 'theme', label: 'Website Design Theme' },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@InjectRepository(Setting) private repo: Repository<Setting>) {}

  async onModuleInit() {
    for (const s of DEFAULT_SETTINGS) {
      const exists = await this.repo.findOne({ where: { key: s.key } });
      if (!exists) await this.repo.save(this.repo.create(s));
    }
  }

  async findAll(): Promise<Record<string, Setting[]>> {
    const all = await this.repo.find({ order: { group: 'ASC' } });
    return all.reduce((acc, s) => {
      const g = s.group ?? 'general';
      if (!acc[g]) acc[g] = [];
      acc[g].push(s);
      return acc;
    }, {} as Record<string, Setting[]>);
  }

  async get(key: string): Promise<string | null> {
    const s = await this.repo.findOne({ where: { key } });
    return s?.value ?? null;
  }

  async set(key: string, value: string): Promise<Setting> {
    let s = await this.repo.findOne({ where: { key } });
    if (s) {
      s.value = value;
      return this.repo.save(s);
    }
    return this.repo.save(this.repo.create({ key, value }));
  }

  async bulkUpdate(updates: { key: string; value: string }[]): Promise<void> {
    for (const u of updates) await this.set(u.key, u.value);
  }
}
