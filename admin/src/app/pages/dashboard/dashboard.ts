import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth';
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

interface RecentContact {
  id: string;
  name: string;
  subject?: string;
  status: string;
  createdAt: string;
}

interface RecentApplication {
  id: string;
  fullName: string;
  position: string;
  status: string;
  createdAt: string;
}

type ReportMetric = 'visits' | 'enquiries' | 'applications' | 'reviews';

const REPORT_SERIES: { key: ReportMetric; label: string; color: string }[] = [
  { key: 'visits', label: 'Visits', color: '#002b5b' },
  { key: 'enquiries', label: 'Enquiries', color: '#c5a059' },
  { key: 'applications', label: 'Applications', color: '#2e7d32' },
  { key: 'reviews', label: 'Reviews', color: '#b91c1c' },
];

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
    devices: { device: string; count: number }[];
    referrers: { source: string; count: number }[];
  } | null = null;
  loading = true;

  recentContacts: RecentContact[] = [];
  recentApplications: RecentApplication[] = [];

  reportFrom: string;
  reportTo: string;
  report: Report | null = null;
  reportLoading = false;
  reportError = false;

  reportPage = 1;
  reportPageSize = 10;

  readonly reportSeries = REPORT_SERIES;
  visibleSeries: Record<ReportMetric, boolean> = { visits: true, enquiries: true, applications: true, reviews: true };

  constructor(private api: ApiService, public auth: AuthService) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    this.reportTo = today.toISOString().slice(0, 10);
    this.reportFrom = start.toISOString().slice(0, 10);
  }

  ngOnInit() {
    // Skip fetching sections this role has no permission to view — avoids
    // needless 403s and misleading "no data" states for restricted roles.
    Promise.allSettled([
      this.api.getTeam().toPromise(),
      this.api.getCareers().toPromise(),
      this.auth.hasPermission('reviews') ? this.api.getReviews().toPromise() : Promise.resolve(null),
      this.auth.hasPermission('contact') ? this.api.getContactSubmissions().toPromise() : Promise.resolve(null),
      this.auth.hasPermission('applications') ? this.api.getApplications().toPromise() : Promise.resolve(null),
      this.api.getAnalytics().toPromise(),
    ]).then(([team, careers, reviews, contacts, applications, analytics]) => {
      const value = (r: PromiseSettledResult<any>) => (r.status === 'fulfilled' ? r.value : null);
      this.stats.team = this.countOf(value(team));
      this.stats.careers = this.countOf(value(careers));
      this.stats.reviews = this.countOf(value(reviews));
      this.stats.contacts = value(contacts)?.counts?.all ?? 0;
      this.stats.applications = value(applications)?.counts?.all ?? 0;
      this.recentContacts = (value(contacts)?.items ?? []).slice(0, 5);
      this.recentApplications = (value(applications)?.items ?? []).slice(0, 5);
      this.analytics = value(analytics);
      this.loading = false;
    });

    this.generateReport();
  }

  toggleSeries(key: ReportMetric) {
    this.visibleSeries[key] = !this.visibleSeries[key];
  }

  private seriesMax(key: ReportMetric): number {
    if (!this.report) return 1;
    return Math.max(...this.report.days.map(d => d[key]), 1);
  }

  /** Chronological (oldest first) view of the report days, for left-to-right chart plotting. */
  get chartDays(): ReportDay[] {
    return this.report ? [...this.report.days].reverse() : [];
  }

  chartPoints(key: ReportMetric): string {
    const days = this.chartDays;
    if (days.length === 0) return '';
    const max = this.seriesMax(key);
    const stepX = days.length > 1 ? 100 / (days.length - 1) : 0;
    return days
      .map((d, i) => {
        const x = days.length > 1 ? i * stepX : 50;
        const y = 100 - (d[key] / max) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  get chartStartLabel(): string {
    const days = this.chartDays;
    return days.length ? this.dayLabelFull(days[0].date) : '';
  }

  get chartEndLabel(): string {
    const days = this.chartDays;
    return days.length ? this.dayLabelFull(days[days.length - 1].date) : '';
  }

  private dayLabelFull(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  contactBadgeClass(status: string): string {
    return `badge-${status}`;
  }

  applicationBadgeClass(status: string): string {
    return `badge-${status}`;
  }

  timeAgo(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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
    this.reportPage = 1;
    this.api.getAnalyticsReport(this.reportFrom, this.reportTo).subscribe({
      next: (data: Report) => { this.report = data; this.reportLoading = false; },
      error: () => { this.reportLoading = false; this.reportError = true; },
    });
  }

  get reportTotalPages(): number {
    if (!this.report) return 1;
    return Math.max(1, Math.ceil(this.report.days.length / this.reportPageSize));
  }

  get pagedReportDays(): ReportDay[] {
    if (!this.report) return [];
    const start = (this.reportPage - 1) * this.reportPageSize;
    return this.report.days.slice(start, start + this.reportPageSize);
  }

  goToReportPage(p: number) {
    if (p < 1 || p > this.reportTotalPages || p === this.reportPage) return;
    this.reportPage = p;
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

  get maxDeviceCount(): number {
    if (!this.analytics?.devices?.length) return 1;
    return Math.max(...this.analytics.devices.map(d => d.count), 1);
  }

  get maxReferrerCount(): number {
    if (!this.analytics?.referrers?.length) return 1;
    return Math.max(...this.analytics.referrers.map(r => r.count), 1);
  }

  dayLabel(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
  }

  formatPath(path: string): string {
    if (path === '/') return '/ (Home)';
    return path;
  }
}
