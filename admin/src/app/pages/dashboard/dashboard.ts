import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats = { team: 0, careers: 0, reviews: 0 };
  analytics: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    topPages: { path: string; count: number }[];
    last7Days: { date: string; count: number }[];
  } | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    Promise.all([
      this.api.getTeam().toPromise(),
      this.api.getCareers().toPromise(),
      this.api.getReviews().toPromise(),
      this.api.getAnalytics().toPromise(),
    ]).then(([team, careers, reviews, analytics]: any[]) => {
      this.stats.team = Array.isArray(team) ? team.length : 0;
      this.stats.careers = Array.isArray(careers) ? careers.length : 0;
      this.stats.reviews = Array.isArray(reviews) ? reviews.length : 0;
      this.analytics = analytics ?? null;
      this.loading = false;
    }).catch(() => { this.loading = false; });
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
