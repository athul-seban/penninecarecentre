import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private roles: RolesService,
    private jwt: JwtService,
  ) {}

  private async buildSessionUser(user: User) {
    const role = await this.roles.findByName(user.role);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: role?.permissions ?? [],
    };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user: await this.buildSessionUser(user),
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.users.findById(userId);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    await this.users.updatePassword(userId, newPassword);
    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, dto: { name?: string; email?: string }) {
    const user = await this.users.updateProfile(userId, dto);
    return this.buildSessionUser(user);
  }

  async getSessionInfo(userId: string) {
    const user = await this.users.findById(userId);
    return this.buildSessionUser(user);
  }
}
