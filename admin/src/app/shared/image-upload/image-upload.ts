import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css'
})
export class ImageUpload {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Input() placeholder = 'Paste image URL…';

  uploading = false;
  error = '';
  fullscreenImage = '';

  private readonly FRONTEND_BASE = 'http://localhost:4200';

  constructor(private api: ApiService) {}

  onUrlInput(url: string) {
    this.value = url;
    this.valueChange.emit(url);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.error = '';
    const fd = new FormData();
    fd.append('file', file);
    this.api.uploadMedia(fd).subscribe({
      next: (res: any) => {
        const url = res.url || res.secure_url;
        this.value = url;
        this.valueChange.emit(url);
        this.uploading = false;
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.uploading = false;
        this.error = 'Upload failed. Please try again.';
      }
    });
  }

  remove() {
    this.value = '';
    this.valueChange.emit('');
  }

  previewUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('/assets/')) return this.FRONTEND_BASE + path;
    return path;
  }

  openFullscreen() { this.fullscreenImage = this.value; }
  closeFullscreen() { this.fullscreenImage = ''; }
}
