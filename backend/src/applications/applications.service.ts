import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerApplication, ApplicationStatus } from './application.entity';
import * as fs from 'fs';
import * as path from 'path';
import { put, del } from '@vercel/blob';
import { SettingsService } from '../settings/settings.service';
import { MailerService } from '../mailer/mailer.service';
import { escapeHtml } from '../common/escape-html';

const CV_DIR = path.join(process.cwd(), 'uploads', 'cv');
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(CareerApplication)
    private repo: Repository<CareerApplication>,
    private settings: SettingsService,
    private mailer: MailerService,
  ) {}

  async submit(data: Partial<CareerApplication>, file?: Express.Multer.File): Promise<CareerApplication> {
    let cvUrl: string | undefined;
    let cvPublicId: string | undefined;
    let cvOriginalName: string | undefined;

    if (file) {
      try {
        const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
        const filename = `${Date.now()}-${safeName}`;

        if (useBlob()) {
          const blob = await put(`cv/${filename}`, file.buffer, {
            access: 'public',
            contentType: file.mimetype,
          });
          cvUrl = blob.url;
          cvPublicId = blob.url;
        } else {
          if (!fs.existsSync(CV_DIR)) fs.mkdirSync(CV_DIR, { recursive: true });
          fs.writeFileSync(path.join(CV_DIR, filename), file.buffer);
          cvUrl = `/uploads/cv/${filename}`;
          cvPublicId = filename;
        }
        cvOriginalName = file.originalname;
      } catch {
        // proceed without CV if save fails
      }
    }

    const application = this.repo.create({ ...data, cvUrl, cvPublicId, cvOriginalName });
    const saved = await this.repo.save(application);
    await this.notifyAdmin(saved).catch((e) =>
      this.logger.warn(`Email send failed: ${e.message}`),
    );
    return saved;
  }

  findAll(): Promise<CareerApplication[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<CareerApplication | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: ApplicationStatus, notes?: string): Promise<CareerApplication> {
    const app = await this.repo.findOneOrFail({ where: { id } });
    app.status = status;
    if (notes !== undefined) app.notes = notes;
    return this.repo.save(app);
  }

  async delete(id: string): Promise<void> {
    const app = await this.repo.findOne({ where: { id } });
    if (app?.cvPublicId) {
      if (app.cvPublicId.startsWith('http')) {
        await del(app.cvPublicId).catch(() => {});
      } else {
        const filepath = path.join(CV_DIR, app.cvPublicId);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      }
    }
    await this.repo.delete(id);
  }

  /** Sends the admin's reply to the applicant. */
  async reply(id: string, subject: string, message: string): Promise<CareerApplication> {
    const app = await this.repo.findOneOrFail({ where: { id } });

    if (!(await this.mailer.isConfigured())) {
      throw new BadRequestException(
        'Email is not configured. Set up SMTP under Settings → Email & SMTP Configuration before sending a reply.',
      );
    }

    const fromEmail = (await this.settings.get('email.contact.from')) || (await this.settings.get('email.smtp.user'));

    try {
      await this.mailer.send({
        to: app.email,
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
      this.logger.warn(`Reply send failed for application ${id}: ${e.message}`);
      throw new BadRequestException(
        `Could not send the email — check your SMTP settings and try again. (${e.message})`,
      );
    }

    return app;
  }

  private async notifyAdmin(app: CareerApplication): Promise<void> {
    const toEmail =
      (await this.settings.get('email.careers.to')) || (await this.settings.get('email.contact.to'));

    if (!toEmail || !(await this.mailer.isConfigured())) {
      this.logger.warn('Email not configured — skipping application notification');
      return;
    }

    const safePosition = app.position.replace(/[\r\n]+/g, ' ');

    await this.mailer.send({
      to: toEmail,
      replyTo: app.email,
      subject: `New Job Application: ${safePosition}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#002b5b">New Job Application – Pennine Care Centre</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;width:120px">Name</td><td style="padding:8px">${escapeHtml(app.fullName)}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${escapeHtml(app.email)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${escapeHtml(app.phone ?? '—')}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Position</td><td style="padding:8px">${escapeHtml(app.position)}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-left:4px solid #c5a059">
            <strong>Cover Letter:</strong><br/><br/>
            ${escapeHtml(app.coverLetter).replace(/\n/g, '<br/>')}
          </div>
          ${app.cvUrl ? `<p style="margin-top:16px"><strong>CV:</strong> <a href="${escapeHtml(app.cvUrl)}">${escapeHtml(app.cvOriginalName ?? 'Download')}</a></p>` : ''}
          <p style="color:#888;font-size:0.8rem;margin-top:24px">Submitted ${new Date(app.createdAt).toLocaleString('en-GB')}</p>
        </div>
      `,
    });
    this.logger.log(`Application email sent to ${toEmail} for application ${app.id}`);
  }
}
