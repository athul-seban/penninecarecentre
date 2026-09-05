import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ImageUpload } from '../../shared/image-upload/image-upload';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-blog-manager',
  imports: [FormsModule, Sidebar, ImageUpload],
  templateUrl: './blog-manager.html',
  styleUrl: './blog-manager.css'
})
export class BlogManager implements OnInit {
  posts: any[] = [];
  loading = true;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: any = { title: '', excerpt: '', content: '', featuredImage: '', isPublished: true };

  filterStatus: 'all' | 'published' | 'draft' = 'all';
  searchQuery = '';
  counts = { all: 0, published: 0, draft: 0 };

  page = 1;
  pageSize = 10;
  total = 0;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getBlogPosts({
      page: this.page,
      pageSize: this.pageSize,
      status: this.filterStatus === 'all' ? undefined : this.filterStatus,
      q: this.searchQuery.trim() || undefined,
    }).subscribe({
      next: (res: any) => {
        this.posts = res.items;
        this.total = res.total;
        this.counts = res.counts;
        this.loading = false;
      },
      error: () => { this.loading = false; }
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

  countFor(status: string): number {
    return (this.counts as unknown as Record<string, number>)[status] ?? 0;
  }

  setFilter(status: 'all' | 'published' | 'draft') {
    this.filterStatus = status;
    this.page = 1;
    this.load();
  }

  applySearch() {
    this.page = 1;
    this.load();
  }

  clearSearch() {
    this.searchQuery = '';
    this.applySearch();
  }

  openAdd() {
    this.form = { title: '', excerpt: '', content: '', featuredImage: '', isPublished: true };
    this.editingId = null;
    this.showForm = true;
  }

  openEdit(p: any) {
    this.form = { ...p };
    this.editingId = p._id || p.id;
    this.showForm = true;
  }

  cancel() { this.showForm = false; }

  save() {
    this.saving = true;
    const obs = this.editingId
      ? this.api.updateBlogPost(this.editingId, this.form)
      : this.api.createBlogPost(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.saving = false; this.load(); },
      error: () => { this.saving = false; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this blog post?')) return;
    this.api.deleteBlogPost(id).subscribe(() => this.load());
  }

  previewUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('/assets/')) return environment.frontendUrl + path;
    return path;
  }
}
