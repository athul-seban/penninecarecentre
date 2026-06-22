import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';

@Component({
  selector: 'app-image-array-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './image-array-upload.html',
  styleUrl: './image-array-upload.css'
})
export class ImageArrayUpload {
  @Input() images: string[] = [];
  @Output() imagesChange = new EventEmitter<string[]>();

  pendingUrl = '';
  uploadingKey = '';
  error = '';
  fullscreenImage = '';

  private readonly FRONTEND_BASE = 'http://localhost:4200';

  constructor(private api: ApiService) {}

  onFileSelected(event: Event, mode: 'add' | 'replace', index = -1) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingKey = mode === 'replace' ? 'replace_' + index : 'add';
    this.error = '';
    const fd = new FormData();
    fd.append('file', file);
    this.api.uploadMedia(fd).subscribe({
      next: (res: any) => {
        const url = res.url || res.secure_url;
        const updated = [...this.images];
        if (mode === 'replace') updated[index] = url;
        else { updated.push(url); this.pendingUrl = ''; }
        this.images = updated;
        this.imagesChange.emit(updated);
        this.uploadingKey = '';
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.uploadingKey = '';
        this.error = 'Upload failed. Please try again.';
      }
    });
  }

  addUrl() {
    const url = this.pendingUrl.trim();
    if (!url) return;
    const updated = [...this.images, url];
    this.images = updated;
    this.imagesChange.emit(updated);
    this.pendingUrl = '';
  }

  remove(index: number) {
    const updated = this.images.filter((_, i) => i !== index);
    this.images = updated;
    this.imagesChange.emit(updated);
  }

  moveUp(index: number) {
    if (index === 0) return;
    const updated = [...this.images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    this.images = updated;
    this.imagesChange.emit(updated);
  }

  moveDown(index: number) {
    if (index === this.images.length - 1) return;
    const updated = [...this.images];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    this.images = updated;
    this.imagesChange.emit(updated);
  }

  filename(path: string): string {
    return path.split('/').pop() || path;
  }

  previewUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('/assets/')) return this.FRONTEND_BASE + path;
    return path;
  }

  openFullscreen(img: string) { this.fullscreenImage = img; }
  closeFullscreen() { this.fullscreenImage = ''; }
}
