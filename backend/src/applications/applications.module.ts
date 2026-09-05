import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerApplication } from './application.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { SettingsModule } from '../settings/settings.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([CareerApplication, User, Role]), SettingsModule, MailerModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
