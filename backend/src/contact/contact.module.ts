import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactSubmission } from './contact.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { SettingsModule } from '../settings/settings.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([ContactSubmission, User, Role]), SettingsModule, MailerModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
