import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageContent } from './page-content.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([PageContent, User, Role])],
  providers: [PagesService],
  controllers: [PagesController],
})
export class PagesModule {}
