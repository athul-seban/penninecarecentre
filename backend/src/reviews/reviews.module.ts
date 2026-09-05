import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([Review, User, Role])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
