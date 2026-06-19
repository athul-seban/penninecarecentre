import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { ContactSubmission, ContactStatus } from './contact.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactSubmission)
    private repo: Repository<ContactSubmission>,
    private settings: SettingsService,
  ) {}

  async submit(data: Partial<ContactSubmission>): Promise<ContactSubmission> {
    const submission = this.repo.create(data);
    const saved = await this.repo.save(submission);
    await this.sendEmail(saved).catch((e) =>
      this.logger.warn(`Email send failed: ${e.message}`),
    );
    return saved;
  }

  findAll(): Promise<ContactSubmission[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<ContactSubmission | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: ContactStatus, notes?: string): Promise<ContactSubmission> {
    const sub = await this.repo.findOneOrFail({ where: { id } });
    sub.status = status;
    if (notes !== undefined) sub.notes = notes;
    return this.repo.save(sub);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private async sendEmail(sub: ContactSubmission): Promise<void> {
    const smtpHost    = await this.settings.get('email.smtp.host');
    const smtpPort    = await this.settings.get('email.smtp.port');
    const smtpUser    = await this.settings.get('email.smtp.user');
    const smtpPass    = await this.settings.get('email.smtp.pass');
    const smtpSecure  = await this.settings.get('email.smtp.secure');
    const toEmail     = await this.settings.get('email.contact.to');
    const fromEmail   = await this.settings.get('email.contact.from');

    if (!smtpHost || !smtpUser || !smtpPass || !toEmail) {
      this.logger.warn('Email not configured — skipping notification');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort ?? '587'),
      secure: smtpSecure === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });

    const subject = sub.subject
      ? `New Contact: ${sub.subject}`
      : `New Contact Enquiry from ${sub.name}`;

    await transporter.sendMail({
      from: fromEmail ?? smtpUser,
      to: toEmail,
      replyTo: sub.email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#002b5b">New Contact Enquiry – Pennine Care Centre</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;width:120px">Name</td><td style="padding:8px">${sub.name}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${sub.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${sub.phone ?? '—'}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Subject</td><td style="padding:8px">${sub.subject ?? '—'}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-left:4px solid #c5a059">
            <strong>Message:</strong><br/><br/>
            ${sub.message.replace(/\n/g, '<br/>')}
          </div>
          <p style="color:#888;font-size:0.8rem;margin-top:24px">Submitted ${new Date(sub.createdAt).toLocaleString('en-GB')}</p>
        </div>
      `,
    });
    this.logger.log(`Contact email sent to ${toEmail} for submission ${sub.id}`);
  }
}
