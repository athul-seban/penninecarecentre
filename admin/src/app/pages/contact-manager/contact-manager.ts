import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';

type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  notes: string;
  createdAt: string;
}

@Component({
  selector: 'app-contact-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-manager.html',
  styleUrl: './contact-manager.css'
})
export class ContactManager implements OnInit {
  submissions: ContactSubmission[] = [];
  filtered: ContactSubmission[] = [];
  selected: ContactSubmission | null = null;
  filterStatus: string = 'all';
  loading = true;
  saving = false;
  toast = '';
  notesDraft = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getContactSubmissions().subscribe({
      next: (data) => {
        this.submissions = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter() {
    this.filtered = this.filterStatus === 'all'
      ? this.submissions
      : this.submissions.filter(s => s.status === this.filterStatus);
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilter();
  }

  open(sub: ContactSubmission) {
    this.selected = sub;
    this.notesDraft = sub.notes ?? '';
    if (sub.status === 'new') this.setStatus(sub, 'read');
  }

  close() { this.selected = null; }

  setStatus(sub: ContactSubmission, status: ContactStatus) {
    sub.status = status;
    this.api.updateContactSubmission(sub.id, { status, notes: sub.notes }).subscribe();
    this.applyFilter();
  }

  save() {
    if (!this.selected) return;
    this.saving = true;
    this.api.updateContactSubmission(this.selected.id, {
      status: this.selected.status,
      notes: this.notesDraft
    }).subscribe({
      next: (updated) => {
        this.selected!.notes = updated.notes;
        const i = this.submissions.findIndex(s => s.id === updated.id);
        if (i > -1) this.submissions[i] = updated;
        this.applyFilter();
        this.saving = false;
        this.showToast('Notes saved');
      },
      error: () => { this.saving = false; }
    });
  }

  delete(sub: ContactSubmission) {
    if (!confirm(`Delete enquiry from ${sub.name}?`)) return;
    this.api.deleteContactSubmission(sub.id).subscribe({
      next: () => {
        this.submissions = this.submissions.filter(s => s.id !== sub.id);
        this.applyFilter();
        if (this.selected?.id === sub.id) this.selected = null;
        this.showToast('Submission deleted');
      }
    });
  }

  badgeClass(status: ContactStatus): string {
    return { new: 'badge-new', read: 'badge-read', replied: 'badge-replied', archived: 'badge-archived' }[status];
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }

  countByStatus(status: string): number {
    return this.submissions.filter(s => s.status === status).length;
  }

  formatDate(d: string) {
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  mailto(sub: ContactSubmission) {
    const subject = encodeURIComponent(`Re: ${sub.subject || 'Your Enquiry'} – Pennine Care Centre`);
    window.open(`mailto:${sub.email}?subject=${subject}`, '_blank');
    this.setStatus(sub, 'replied');
  }
}
