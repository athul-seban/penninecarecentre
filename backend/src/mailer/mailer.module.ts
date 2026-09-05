import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { MailerService } from './mailer.service';

@Module({
  imports: [SettingsModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
