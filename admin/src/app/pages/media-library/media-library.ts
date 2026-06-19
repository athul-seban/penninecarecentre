import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-media-library',
  imports: [CommonModule, Sidebar],
  templateUrl: './media-library.html',
  styleUrl: './media-library.css'
})
export class MediaLibrary implements OnInit {
  files: any[] = [];
  loading = true;
  uploading = false;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getMedia().subscribe({
      next: (d: any) => { this.files = Array.isArray(d) ? d : []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const formData = new FormData();
    Array.from(input.files).forEach(f => formData.append('file', f));
    this.uploading = true;
    this.api.uploadMedia(formData).subscribe({
      next: () => { this.uploading = false; this.load(); },
      error: () => { this.uploading = false; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this file?')) return;
    this.api.deleteMedia(id).subscribe(() => this.load());
  }

  isImage(file: any): boolean {
    const url: string = file.url || file.path || '';
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  }

  getUrl(file: any): string {
    return file.url || file.path || '';
  }

  getFilename(file: any): string {
    const url = this.getUrl(file);
    return url.split('/').pop() || file.name || 'file';
  }
}
