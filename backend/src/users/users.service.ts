import { Injectable, NotFoundException, ConflictException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { countUsersWithPermission } from '../roles/user-management.util';

type SafeUser = Omit<User, 'password'>;

// Retired single-admin default from the original seed. Actively deleted on every boot so a
// database that already has it from before the move to 3 named accounts can't still be
// logged into with the old published credentials (admin@pinnineCare.com / Admin@123).
const LEGACY_DEFAULT_ADMIN_EMAIL = 'admin@pinnineCare.com';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
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

  private toSafe(user: User): SafeUser {
    const { password, ...safe } = user;
    return safe;
  }

  async findAllSafe(): Promise<SafeUser[]> {
    const users = await this.repo.find({ order: { createdAt: 'ASC' } });
    return users.map((u) => this.toSafe(u));
  }

  async createUser(dto: { name: string; email: string; password: string; role: string }): Promise<SafeUser> {
    const role = await this.roleRepo.findOne({ where: { name: dto.role } });
    if (!role) throw new BadRequestException('Unknown role');
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ email: dto.email, password: hashed, name: dto.name, role: dto.role });
    return this.toSafe(await this.repo.save(user));
  }

  async updateUser(
    id: string,
    dto: { name?: string; email?: string; password?: string; role?: string },
  ): Promise<SafeUser> {
    const user = await this.findById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already exists');
    }

    if (dto.role && dto.role !== user.role) {
      const role = await this.roleRepo.findOne({ where: { name: dto.role } });
      if (!role) throw new BadRequestException('Unknown role');
      const remaining = await countUsersWithPermission(this.repo, this.roleRepo, 'users', {
        userRoleOverride: { userId: id, roleName: dto.role },
      });
      if (remaining === 0) {
        throw new BadRequestException('Cannot remove the last user with Users & Roles management access.');
      }
    }

    const update: Partial<User> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.email !== undefined) update.email = dto.email;
    if (dto.role !== undefined) update.role = dto.role;
    if (dto.password) update.password = await bcrypt.hash(dto.password, 10);

    await this.repo.update(id, update);
    return this.toSafe(await this.findById(id));
  }

  async removeUser(id: string, requesterId: string): Promise<{ message: string }> {
    if (id === requesterId) throw new BadRequestException('You cannot delete your own account.');
    await this.findById(id);

    const remaining = await countUsersWithPermission(this.repo, this.roleRepo, 'users', { excludeUserId: id });
    if (remaining === 0) {
      throw new BadRequestException('Cannot delete the last user with Users & Roles management access.');
    }

    await this.repo.delete(id);
    return { message: 'User deleted' };
  }

  // Self-service profile update (name/email only — never role or password here).
  async updateProfile(id: string, dto: { name?: string; email?: string }): Promise<User> {
    if (dto.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) throw new ConflictException('Email already in use');
    }
    const update: Partial<User> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.email !== undefined) update.email = dto.email;
    await this.repo.update(id, update);
    return this.findById(id);
  }
}
