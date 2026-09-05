import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

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
  imports: [CommonModule, FormsModule, Sidebar],
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
    const previous = sub.status;
    sub.status = status;
    this.applyFilter();
    this.api.updateContactSubmission(sub.id, { status, notes: sub.notes }).subscribe({
      error: (e) => {
        sub.status = previous;
        this.applyFilter();
        this.showToast(this.extractError(e, 'Failed to update status'), 'error');
      }
    });
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
      error: (e) => {
        this.saving = false;
        this.showToast(this.extractError(e, 'Failed to save notes'), 'error');
      }
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
      },
      error: (e) => this.showToast(this.extractError(e, 'Failed to delete submission'), 'error')
    });
  }

  badgeClass(status: ContactStatus): string {
    return { new: 'badge-new', read: 'badge-read', replied: 'badge-replied', archived: 'badge-archived' }[status];
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
    return this.submissions.filter(s => s.status === status).length;
  }

  formatDate(d: string) {
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  openReply(sub: ContactSubmission) {
    this.replySubject = `Re: ${sub.subject || 'Your Enquiry'} – Pennine Care Centre`;
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
    this.api.replyToContact(this.selected.id, {
      subject: this.replySubject,
      message: this.replyMessage
    }).subscribe({
      next: (updated) => {
        this.selected!.status = updated.status;
        const i = this.submissions.findIndex(s => s.id === updated.id);
        if (i > -1) this.submissions[i] = updated;
        this.applyFilter();
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
