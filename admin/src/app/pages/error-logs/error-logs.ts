import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-error-logs',
  standalone: true,
  imports: [CommonModule, DatePipe, Sidebar],
  templateUrl: './error-logs.html',
  styleUrl: './error-logs.css'
})
export class ErrorLogs implements OnInit {
  logs: any[] = [];
  loading = true;
  clearing = false;
  expanded: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getErrorLogs().subscribe({
      next: (d) => { this.logs = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggle(id: string) {
    this.expanded = this.expanded === id ? null : id;
  }

  clear() {
    if (!confirm('Clear all error logs? This cannot be undone.')) return;
    this.clearing = true;
    this.api.clearErrorLogs().subscribe({
      next: () => { this.logs = []; this.clearing = false; },
      error: () => { this.clearing = false; }
    });
  }
}
