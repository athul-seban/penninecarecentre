import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../core/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css'
})
export class ImageUpload {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Input() accept = 'image/*';

  uploading = false;
  isDragging = false;
  error = '';
  fullscreenImage = '';

  private readonly FRONTEND_BASE = environment.frontendUrl;

  constructor(private api: ApiService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (!this.uploading) this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (this.uploading) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file);
  }

  private uploadFile(file: File) {
    this.uploading = true;
    this.error = '';
    const fd = new FormData();
    fd.append('file', file);
    this.api.uploadMedia(fd).subscribe({
      next: (res: any) => {
        this.value = res.url;
        this.valueChange.emit(res.url);
        this.uploading = false;
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

  isVideo(url: string): boolean {
    if (!url) return false;
    const clean = url.split('?')[0].toLowerCase();
    return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg') || clean.endsWith('.mov');
  }

  previewUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('/assets/')) return this.FRONTEND_BASE + path;
    return path;
  }

  openFullscreen() { this.fullscreenImage = this.value; }
  closeFullscreen() { this.fullscreenImage = ''; }
}
