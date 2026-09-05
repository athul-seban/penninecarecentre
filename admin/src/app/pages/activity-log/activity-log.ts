import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, Sidebar],
  templateUrl: './activity-log.html',
  styleUrl: './activity-log.css'
})
export class ActivityLog implements OnInit {
  logs: any[] = [];
  loading = true;
  expanded: string | null = null;

  methodFilter = '';
  dateFrom = '';
  dateTo = '';
  search = '';

  page = 1;
  pageSize = 25;
  total = 0;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getAuditLogs({
      page: this.page,
      pageSize: this.pageSize,
      method: this.methodFilter || undefined,
      from: this.dateFrom || undefined,
      to: this.dateTo || undefined,
      q: this.search.trim() || undefined,
    }).subscribe({
      next: (res) => {
        this.logs = res.items;
        this.total = res.total;
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

  applyFilters() {
    this.page = 1;
    this.load();
  }

  clearFilters() {
    this.methodFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.search = '';
    this.page = 1;
    this.load();
  }

  toggle(id: string) {
    this.expanded = this.expanded === id ? null : id;
  }
}
