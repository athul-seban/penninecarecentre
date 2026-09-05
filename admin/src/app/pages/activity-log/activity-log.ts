import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [DatePipe, Sidebar],
  templateUrl: './activity-log.html',
  styleUrl: './activity-log.css'
})
export class ActivityLog implements OnInit {
  logs: any[] = [];
  loading = true;
  clearing = false;
  expanded: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getAuditLogs().subscribe({
      next: (d) => { this.logs = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggle(id: string) {
    this.expanded = this.expanded === id ? null : id;
  }

  clear() {
    if (!confirm('Clear all activity logs? This cannot be undone.')) return;
    this.clearing = true;
    this.api.clearAuditLogs().subscribe({
      next: () => { this.logs = []; this.clearing = false; },
      error: () => { this.clearing = false; }
    });
  }
}
