import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from './team-member.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([TeamMember, User, Role])],
  providers: [TeamService],
  controllers: [TeamController],
})
export class TeamModule {}
