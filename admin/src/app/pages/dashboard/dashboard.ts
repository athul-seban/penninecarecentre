import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

interface ReportDay {
  date: string;
  visits: number;
  enquiries: number;
  applications: number;
  reviews: number;
}

interface Report {
  from: string;
  to: string;
  totals: { visits: number; enquiries: number; applications: number; reviews: number };
  days: ReportDay[];
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats = { team: 0, careers: 0, reviews: 0, contacts: 0, applications: 0 };
  analytics: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    topPages: { path: string; count: number }[];
    last7Days: { date: string; count: number }[];
  } | null = null;
  loading = true;

  reportFrom: string;
  reportTo: string;
  report: Report | null = null;
  reportLoading = false;
  reportError = false;

  constructor(private api: ApiService) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    this.reportTo = today.toISOString().slice(0, 10);
    this.reportFrom = start.toISOString().slice(0, 10);
  }

  ngOnInit() {
    Promise.allSettled([
      this.api.getTeam().toPromise(),
      this.api.getCareers().toPromise(),
      this.api.getReviews().toPromise(),
      this.api.getContactSubmissions().toPromise(),
      this.api.getApplications().toPromise(),
      this.api.getAnalytics().toPromise(),
    ]).then(([team, careers, reviews, contacts, applications, analytics]) => {
      const value = (r: PromiseSettledResult<any>) => (r.status === 'fulfilled' ? r.value : null);
      this.stats.team = this.countOf(value(team));
      this.stats.careers = this.countOf(value(careers));
      this.stats.reviews = this.countOf(value(reviews));
      this.stats.contacts = this.countOf(value(contacts));
      this.stats.applications = this.countOf(value(applications));
      this.analytics = value(analytics);
      this.loading = false;
    });

    this.generateReport();
  }

  private countOf(data: any): number {
    return Array.isArray(data) ? data.length : 0;
  }

  generateReport() {
    if (!this.reportFrom || !this.reportTo || this.reportFrom > this.reportTo) {
      this.reportError = true;
      return;
    }
    this.reportLoading = true;
    this.reportError = false;
    this.api.getAnalyticsReport(this.reportFrom, this.reportTo).subscribe({
      next: (data: Report) => { this.report = data; this.reportLoading = false; },
      error: () => { this.reportLoading = false; this.reportError = true; },
    });
  }

  exportReportCsv() {
    if (!this.report) return;
    const header = 'Date,Visits,Enquiries,Applications,Reviews';
    const rows = this.report.days.map(d => `${d.date},${d.visits},${d.enquiries},${d.applications},${d.reviews}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pennine-care-report_${this.report.from}_to_${this.report.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get maxPageCount(): number {
    if (!this.analytics?.topPages?.length) return 1;
    return Math.max(...this.analytics.topPages.map(p => p.count));
  }

  get maxDayCount(): number {
    if (!this.analytics?.last7Days?.length) return 1;
    return Math.max(...this.analytics.last7Days.map(d => d.count), 1);
  }

  dayLabel(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
  }

  formatPath(path: string): string {
    if (path === '/') return '/ (Home)';
    return path;
  }
}
