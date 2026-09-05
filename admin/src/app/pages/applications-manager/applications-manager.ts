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

@Component({
  selector: 'app-applications-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './applications-manager.html',
  styleUrl: './applications-manager.css'
})
export class ApplicationsManager implements OnInit {
  applications: CareerApplication[] = [];
  filtered: CareerApplication[] = [];
  selected: CareerApplication | null = null;
  filterStatus: string = 'all';
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

  load() {
    this.loading = true;
    this.api.getApplications().subscribe({
      next: (data: CareerApplication[]) => {
        this.applications = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter() {
    this.filtered = this.filterStatus === 'all'
      ? this.applications
      : this.applications.filter(a => a.status === this.filterStatus);
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilter();
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
    this.applyFilter();
    this.api.updateApplication(app.id, { status, notes: app.notes }).subscribe({
      error: (e) => {
        app.status = previous;
        this.applyFilter();
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
        this.applyFilter();
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
        this.applications = this.applications.filter(a => a.id !== app.id);
        this.applyFilter();
        if (this.selected?.id === app.id) this.selected = null;
        this.showToast('Application deleted');
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

  countByStatus(status: string): number {
    return this.applications.filter(a => a.status === status).length;
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
