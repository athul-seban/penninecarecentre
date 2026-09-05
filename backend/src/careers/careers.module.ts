import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([Job, User, Role])],
  providers: [CareersService],
  controllers: [CareersController],
})
export class CareersModule {}
