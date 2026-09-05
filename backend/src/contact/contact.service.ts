import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission, ContactStatus } from './contact.entity';
import { SettingsService } from '../settings/settings.service';
import { MailerService } from '../mailer/mailer.service';
import { escapeHtml } from '../common/escape-html';
import { applyDateRange, parsePagination } from '../common/query.util';

export interface FindContactQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  from?: string;
  to?: string;
}

export interface PaginatedContactSubmissions {
  items: ContactSubmission[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<'all' | ContactStatus, number>;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactSubmission)
    private repo: Repository<ContactSubmission>,
    private settings: SettingsService,
    private mailer: MailerService,
  ) {}

  async submit(data: Partial<ContactSubmission>): Promise<ContactSubmission> {
    const submission = this.repo.create(data);
    const saved = await this.repo.save(submission);
    await this.notifyAdmin(saved).catch((e) =>
      this.logger.warn(`Email send failed: ${e.message}`),
    );
    return saved;
  }

  async findAll(query: FindContactQuery = {}): Promise<PaginatedContactSubmissions> {
    const { page, pageSize, skip } = parsePagination(query.page, query.pageSize);

    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC');
    applyDateRange(qb, 'c.createdAt', query.from, query.to);
    if (query.status) qb.andWhere('c.status = :status', { status: query.status });

    const [items, total] = await qb.skip(skip).take(pageSize).getManyAndCount();
    const counts = await this.getStatusCounts(query.from, query.to);

    return { items, total, page, pageSize, counts };
  }

  private async getStatusCounts(from?: string, to?: string): Promise<Record<'all' | ContactStatus, number>> {
    const qb = this.repo
      .createQueryBuilder('c')
      .select('c.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.status');
    applyDateRange(qb, 'c.createdAt', from, to);

    const rows = await qb.getRawMany<{ status: ContactStatus; count: string }>();
    const counts: Record<'all' | ContactStatus, number> = { all: 0, new: 0, read: 0, replied: 0, archived: 0 };
    for (const row of rows) {
      const n = parseInt(row.count, 10);
      counts[row.status] = n;
      counts.all += n;
    }
    return counts;
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

  /** Sends the admin's reply to the enquirer and marks the submission as replied. */
  async reply(id: string, subject: string, message: string): Promise<ContactSubmission> {
    const sub = await this.repo.findOneOrFail({ where: { id } });

    if (!(await this.mailer.isConfigured())) {
      throw new BadRequestException(
        'Email is not configured. Set up SMTP under Settings → Email & SMTP Configuration before sending a reply.',
      );
    }

    const fromEmail = (await this.settings.get('email.contact.from')) || (await this.settings.get('email.smtp.user'));

    try {
      await this.mailer.send({
        to: sub.email,
        replyTo: fromEmail ?? undefined,
        subject: subject.replace(/[\r\n]+/g, ' '),
        html: `
          <div style="font-family:sans-serif;max-width:600px">
            <div style="line-height:1.7;color:#374151">${escapeHtml(message).replace(/\n/g, '<br/>')}</div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
            <p style="color:#888;font-size:0.8rem">Pennine Care Centre${fromEmail ? ` · ${escapeHtml(fromEmail)}` : ''}</p>
          </div>
        `,
      });
    } catch (e: any) {
      this.logger.warn(`Reply send failed for submission ${id}: ${e.message}`);
      throw new BadRequestException(
        `Could not send the email — check your SMTP settings and try again. (${e.message})`,
      );
    }

    sub.status = 'replied';
    return this.repo.save(sub);
  }

  private async notifyAdmin(sub: ContactSubmission): Promise<void> {
    const toEmail = await this.settings.get('email.contact.to');

    if (!toEmail || !(await this.mailer.isConfigured())) {
      this.logger.warn('Email not configured — skipping notification');
      return;
    }

    // Strip CR/LF defensively (SMTP header injection) and HTML-escape before interpolating into the email body (HTML injection).
    const safeSubject = sub.subject?.replace(/[\r\n]+/g, ' ');
    const subject = safeSubject
      ? `New Contact: ${safeSubject}`
      : `New Contact Enquiry from ${sub.name.replace(/[\r\n]+/g, ' ')}`;

    await this.mailer.send({
      to: toEmail,
      replyTo: sub.email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#002b5b">New Contact Enquiry – Pennine Care Centre</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;width:120px">Name</td><td style="padding:8px">${escapeHtml(sub.name)}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${escapeHtml(sub.email)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${escapeHtml(sub.phone ?? '—')}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Subject</td><td style="padding:8px">${escapeHtml(sub.subject ?? '—')}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-left:4px solid #c5a059">
            <strong>Message:</strong><br/><br/>
            ${escapeHtml(sub.message).replace(/\n/g, '<br/>')}
          </div>
          <p style="color:#888;font-size:0.8rem;margin-top:24px">Submitted ${new Date(sub.createdAt).toLocaleString('en-GB')}</p>
        </div>
      `,
    });
    this.logger.log(`Contact email sent to ${toEmail} for submission ${sub.id}`);
  }
}
