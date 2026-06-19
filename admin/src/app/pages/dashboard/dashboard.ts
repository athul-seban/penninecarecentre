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
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    Promise.all([
      this.api.getTeam().toPromise(),
      this.api.getCareers().toPromise(),
      this.api.getReviews().toPromise()
    ]).then(([team, careers, reviews]: any[]) => {
      this.stats.team = Array.isArray(team) ? team.length : 0;
      this.stats.careers = Array.isArray(careers) ? careers.length : 0;
      this.stats.reviews = Array.isArray(reviews) ? reviews.length : 0;
      this.loading = false;
    }).catch(() => { this.loading = false; });
  }
}
