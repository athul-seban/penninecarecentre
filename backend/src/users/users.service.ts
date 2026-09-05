import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';

// Retired single-admin default from the original seed. Actively deleted on every boot so a
// database that already has it from before the move to 3 named accounts can't still be
// logged into with the old published credentials (admin@pinnineCare.com / Admin@123).
const LEGACY_DEFAULT_ADMIN_EMAIL = 'admin@pinnineCare.com';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.repo.delete({ email: LEGACY_DEFAULT_ADMIN_EMAIL });

    for (let i = 1; i <= 3; i++) {
      const email = this.config.get<string>(`ADMIN${i}_EMAIL`);
      if (!email) {
        this.logger.warn(`ADMIN${i}_EMAIL not set — skipping admin account ${i}.`);
        continue;
      }
      const existing = await this.repo.findOne({ where: { email } });
      if (existing) continue;

      let password = this.config.get<string>(`ADMIN${i}_PASSWORD`);
      if (!password) {
        // Never fall back to a fixed/documented default password — generate a random one so a
        // misconfigured deployment can't end up with a guessable admin account.
        password = randomBytes(12).toString('base64url');
        this.logger.warn(
          `ADMIN${i}_PASSWORD was not set — generated a random password for ${email}. ` +
          `Set ADMIN${i}_PASSWORD in your environment to control this. Generated password: ${password}`,
        );
      }
      const name = this.config.get<string>(`ADMIN${i}_NAME`) ?? `Admin ${i}`;
      await this.create(email, password, name);
      console.log(`Admin account created: ${email}`);
    }
  }

  async create(email: string, password: string, name?: string): Promise<User> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');
    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, password: hashed, name });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { password: hashed });
  }
}
