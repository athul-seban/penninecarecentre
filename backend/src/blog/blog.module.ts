import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './blog-post.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([BlogPost, User, Role])],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule {}
