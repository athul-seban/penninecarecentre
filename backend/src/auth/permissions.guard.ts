import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { PERMISSIONS_KEY } from './permissions.decorator';

// Must run after JwtAuthGuard (req.user.id needs to already be set). Re-reads the
// user's role/permissions from the DB on every request rather than trusting the JWT,
// so a permission change an admin makes takes effect immediately, not on next login.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    if (!userId) return false;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return false;

    const role = await this.roleRepo.findOne({ where: { name: user.role } });
    const permissions = role?.permissions ?? [];
    const allowed = required.some((key) => permissions.includes(key));
    if (!allowed) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
    return true;
  }
}
