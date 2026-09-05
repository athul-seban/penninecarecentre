import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactSubmission } from './contact.entity';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { SettingsModule } from '../settings/settings.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactSubmission]), SettingsModule, MailerModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
