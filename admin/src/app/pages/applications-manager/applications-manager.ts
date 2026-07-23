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
  notesDraft = '';

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
    app.status = status;
    this.api.updateApplication(app.id, { status, notes: app.notes }).subscribe();
    this.applyFilter();
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
      error: () => { this.saving = false; }
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
      }
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

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }

  countByStatus(status: string): number {
    return this.applications.filter(a => a.status === status).length;
  }

  formatDate(d: string) {
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  mailto(app: CareerApplication) {
    const subject = encodeURIComponent(`Re: Your Application – ${app.position} – Pennine Care Centre`);
    window.open(`mailto:${app.email}?subject=${subject}`, '_blank');
    this.setStatus(app, 'reviewing');
  }
}
