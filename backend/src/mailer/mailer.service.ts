import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private settings: SettingsService) {}

  /** Whether enough SMTP config is present to attempt a send. */
  async isConfigured(): Promise<boolean> {
    const [host, user, pass] = await Promise.all([
      this.settings.get('email.smtp.host'),
      this.settings.get('email.smtp.user'),
      this.settings.get('email.smtp.pass'),
    ]);
    return !!(host && user && pass);
  }

  async send(message: MailMessage): Promise<void> {
    const smtpHost = await this.settings.get('email.smtp.host');
    const smtpPort = await this.settings.get('email.smtp.port');
    const smtpUser = await this.settings.get('email.smtp.user');
    const smtpPass = await this.settings.get('email.smtp.pass');
    const smtpSecure = await this.settings.get('email.smtp.secure');
    const fromEmail = await this.settings.get('email.contact.from');

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error(
        'SMTP is not configured — set it under Admin → Settings → Email & SMTP Configuration',
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort ?? '587'),
      secure: smtpSecure === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: fromEmail || smtpUser,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
    });
  }
}
