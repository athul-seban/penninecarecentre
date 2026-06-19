import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-reviews-manager',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './reviews-manager.html',
  styleUrl: './reviews-manager.css'
})
export class ReviewsManager implements OnInit {
  reviews: any[] = [];
  loading = true;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: any = { author: '', rating: 5, text: '', date: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getReviews().subscribe({
      next: (d: any) => { this.reviews = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAdd() { this.form = { author: '', rating: 5, text: '', date: '' }; this.editingId = null; this.showForm = true; }
  openEdit(r: any) { this.form = { ...r }; this.editingId = r._id || r.id; this.showForm = true; }
  cancel() { this.showForm = false; }

  save() {
    this.saving = true;
    const obs = this.editingId
      ? this.api.updateReview(this.editingId, this.form)
      : this.api.createReview(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.saving = false; this.load(); },
      error: () => { this.saving = false; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this review?')) return;
    this.api.deleteReview(id).subscribe(() => this.load());
  }

  stars(n: number): string { return Array(n).fill('★').join(''); }
}
