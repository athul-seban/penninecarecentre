import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.config.get('ADMIN_EMAIL', 'admin@pinnineCare.com');
    const existing = await this.repo.findOne({ where: { email } });
    if (!existing) {
      let password = this.config.get<string>('ADMIN_PASSWORD');
      if (!password) {
        // Never fall back to a fixed/documented default password — generate a random one so a
        // misconfigured deployment can't end up with a guessable admin account.
        password = randomBytes(12).toString('base64url');
        this.logger.warn(
          `ADMIN_PASSWORD was not set — generated a random password for ${email}. ` +
          `Set ADMIN_PASSWORD in your environment to control this. Generated password: ${password}`,
        );
      }
      await this.create(email, password, 'Admin');
      console.log(`Default admin created: ${email}`);
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
