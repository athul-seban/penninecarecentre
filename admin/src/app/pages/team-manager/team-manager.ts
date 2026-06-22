import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-team-manager',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './team-manager.html',
  styleUrl: './team-manager.css'
})
export class TeamManager implements OnInit {
  members: any[] = [];
  loading = true;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: any = { name: '', role: '', bio: '', photoUrl: '' };

  uploadingPhoto = false;
  uploadError = '';
  fullscreenImage = '';

  private readonly FRONTEND_BASE = 'http://localhost:4200';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getTeam().subscribe({
      next: (d: any) => { this.members = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAdd() {
    this.form = { name: '', role: '', bio: '', photoUrl: '' };
    this.editingId = null;
    this.uploadError = '';
    this.showForm = true;
  }

  openEdit(m: any) {
    this.form = { ...m };
    this.editingId = m._id || m.id;
    this.uploadError = '';
    this.showForm = true;
  }

  cancel() { this.showForm = false; }

  save() {
    this.saving = true;
    const obs = this.editingId
      ? this.api.updateTeamMember(this.editingId, this.form)
      : this.api.createTeamMember(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.saving = false; this.load(); },
      error: () => { this.saving = false; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this team member?')) return;
    this.api.deleteTeamMember(id).subscribe(() => this.load());
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingPhoto = true;
    this.uploadError = '';
    const fd = new FormData();
    fd.append('file', file);
    this.api.uploadMedia(fd).subscribe({
      next: (res: any) => {
        this.form.photoUrl = res.url || res.secure_url;
        this.uploadingPhoto = false;
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.uploadingPhoto = false;
        this.uploadError = 'Upload failed. Please try again.';
      }
    });
  }

  previewUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('/assets/')) return this.FRONTEND_BASE + path;
    return path;
  }

  openFullscreen(path: string) { this.fullscreenImage = path; }
  closeFullscreen() { this.fullscreenImage = ''; }
}
