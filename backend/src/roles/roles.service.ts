import { Injectable, OnModuleInit, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { User } from '../users/user.entity';
import { PERMISSION_KEYS, sanitizePermissions } from './permissions';
import { countUsersWithPermission } from './user-management.util';

const DEFAULT_ROLES: { name: string; permissions: string[]; isSystem: boolean }[] = [
  { name: 'admin', permissions: [...PERMISSION_KEYS], isSystem: true },
  {
    name: 'manager',
    permissions: ['pages', 'team', 'careers', 'reviews', 'blog', 'contact', 'applications'],
    isSystem: false,
  },
  { name: 'hr', permissions: ['team', 'careers', 'applications'], isSystem: false },
];

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private repo: Repository<Role>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    for (const seed of DEFAULT_ROLES) {
      const existing = await this.repo.findOne({ where: { name: seed.name } });
      if (!existing) await this.repo.save(this.repo.create(seed));
    }
  }

  findAll(): Promise<Role[]> {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  findByName(name: string): Promise<Role | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(dto: { name: string; permissions: string[] }): Promise<Role> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('A role with that name already exists');
    const role = this.repo.create({
      name: dto.name,
      permissions: sanitizePermissions(dto.permissions),
      isSystem: false,
    });
    return this.repo.save(role);
  }

  async update(id: string, dto: { name?: string; permissions?: string[] }): Promise<Role> {
    const role = await this.findById(id);

    if (dto.permissions) {
      const permissions = sanitizePermissions(dto.permissions);
      if (!permissions.includes('users')) {
        const remaining = await countUsersWithPermission(this.userRepo, this.repo, 'users', {
          rolePermissionsOverride: { roleId: id, permissions },
        });
        if (remaining === 0) {
          throw new BadRequestException(
            'At least one user must retain Users & Roles management access. Grant it to another role first.',
          );
        }
      }
      role.permissions = permissions;
    }

    if (dto.name && dto.name !== role.name) {
      if (role.isSystem) {
        throw new BadRequestException('This is a protected system role and cannot be renamed.');
      }
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('A role with that name already exists');
      // Users reference roles by name, not id — keep them pointed at the renamed role.
      await this.userRepo.update({ role: role.name }, { role: dto.name });
      role.name = dto.name;
    }

    return this.repo.save(role);
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.findById(id);
    if (role.isSystem) {
      throw new BadRequestException('This is a protected system role and cannot be deleted.');
    }
    const assigned = await this.userRepo.count({ where: { role: role.name } });
    if (assigned > 0) {
      throw new ConflictException('Reassign the users on this role before deleting it.');
    }
    await this.repo.delete(id);
    return { message: 'Role deleted' };
  }
}
