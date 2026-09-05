import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'archived';

interface CareerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  coverLetter: string;
  cvUrl: string | null;
  cvOriginalName: string | null;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
}

interface ApplicationCounts {
  all: number;
  new: number;
  reviewing: number;
  shortlisted: number;
  rejected: number;
  archived: number;
}

@Component({
  selector: 'app-applications-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './applications-manager.html',
  styleUrl: './applications-manager.css'
})
export class ApplicationsManager implements OnInit {
  applications: CareerApplication[] = [];
  selected: CareerApplication | null = null;
  filterStatus: string = 'all';
  dateFrom = '';
  dateTo = '';
  counts: ApplicationCounts = { all: 0, new: 0, reviewing: 0, shortlisted: 0, rejected: 0, archived: 0 };

  page = 1;
  pageSize = 10;
  total = 0;

  loading = true;
  saving = false;
  toast = '';
  toastType: 'success' | 'error' = 'success';
  notesDraft = '';

  replying = false;
  sendingReply = false;
  replySubject = '';
  replyMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load(showLoading = true) {
    if (showLoading) this.loading = true;
    this.api.getApplications({
      page: this.page,
      pageSize: this.pageSize,
      status: this.filterStatus === 'all' ? undefined : this.filterStatus,
      from: this.dateFrom || undefined,
      to: this.dateTo || undefined,
    }).subscribe({
      next: (res) => {
        this.applications = res.items;
        this.total = res.total;
        this.counts = res.counts;
        if (this.selected) {
          this.selected = this.applications.find(a => a.id === this.selected!.id) ?? this.selected;
        }
        if (showLoading) this.loading = false;
      },
      error: () => { if (showLoading) this.loading = false; }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.page = 1;
    this.load();
  }

  applyDateFilter() {
    this.page = 1;
    this.load();
  }

  clearDateFilter() {
    this.dateFrom = '';
    this.dateTo = '';
    this.page = 1;
    this.load();
  }

  open(app: CareerApplication) {
    this.selected = app;
    this.notesDraft = app.notes ?? '';
    if (app.status === 'new') this.setStatus(app, 'reviewing');
  }

  close() { this.selected = null; }

  setStatus(app: CareerApplication, status: ApplicationStatus) {
    const previous = app.status;
    app.status = status;
    this.api.updateApplication(app.id, { status, notes: app.notes }).subscribe({
      next: () => this.load(false),
      error: (e) => {
        app.status = previous;
        this.showToast(this.extractError(e, 'Failed to update status'), 'error');
      }
    });
  }

  save() {
    if (!this.selected) return;
    this.saving = true;
    this.api.updateApplication(this.selected.id, {
      status: this.selected.status,
      notes: this.notesDraft
    }).subscribe({
      next: (updated: CareerApplication) => {
        this.selected!.notes = updated.notes;
        const i = this.applications.findIndex(a => a.id === updated.id);
        if (i > -1) this.applications[i] = updated;
        this.saving = false;
        this.showToast('Notes saved');
      },
      error: (e) => {
        this.saving = false;
        this.showToast(this.extractError(e, 'Failed to save notes'), 'error');
      }
    });
  }

  delete(app: CareerApplication) {
    if (!confirm(`Delete application from ${app.fullName}?`)) return;
    this.api.deleteApplication(app.id).subscribe({
      next: () => {
        if (this.selected?.id === app.id) this.selected = null;
        this.showToast('Application deleted');
        this.load(false);
      },
      error: (e) => this.showToast(this.extractError(e, 'Failed to delete application'), 'error')
    });
  }

  badgeClass(status: ApplicationStatus): string {
    return {
      new: 'badge-new',
      reviewing: 'badge-reviewing',
      shortlisted: 'badge-shortlisted',
      rejected: 'badge-rejected',
      archived: 'badge-archived'
    }[status];
  }

  countFor(status: string): number {
    return (this.counts as unknown as Record<string, number>)[status] ?? 0;
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', type === 'error' ? 5000 : 3000);
  }

  private extractError(e: any, fallback: string): string {
    const msg = e?.error?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    return msg || fallback;
  }

  formatDate(d: string) {
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  openReply(app: CareerApplication) {
    this.replySubject = `Re: Your Application – ${app.position} – Pennine Care Centre`;
    this.replyMessage = '';
    this.replying = true;
  }

  closeReply() {
    this.replying = false;
  }

  sendReply() {
    if (!this.selected) return;
    if (!this.replySubject.trim()) {
      this.showToast('Subject is required', 'error');
      return;
    }
    if (!this.replyMessage.trim()) {
      this.showToast('Message is required', 'error');
      return;
    }
    this.sendingReply = true;
    this.api.replyToApplication(this.selected.id, {
      subject: this.replySubject,
      message: this.replyMessage
    }).subscribe({
      next: () => {
        this.sendingReply = false;
        this.replying = false;
        this.showToast('Reply sent to ' + this.selected!.email);
      },
      error: (e) => {
        this.sendingReply = false;
        this.showToast(this.extractError(e, 'Failed to send email. Check your SMTP settings.'), 'error');
      }
    });
  }
}
