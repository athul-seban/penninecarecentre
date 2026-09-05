import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ContentService } from '../../core/content.service';
import { SeoService } from '../../core/seo.service';
import { environment } from '../../../environments/environment';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class TeamComponent implements OnInit, AfterViewInit {
  sections: Record<string, string> = {};
  teamMembers: TeamMember[] = [];

  constructor(private content: ContentService, private router: Router, private http: HttpClient, private seo: SeoService) {}

  ngOnInit(): void {
    this.content.getPage('team').subscribe({
      next: s => {
        this.sections = s;
        this.seo.update({ title: s['metaTitle'], description: s['metaDescription'], path: '/team' });
      },
      error: () => this.router.navigate(['/not-found'])
    });
    this.http.get<TeamMember[]>(`${environment.apiUrl}/team?active=true`).subscribe({
      next: members => { this.teamMembers = members; },
      error: () => { this.teamMembers = []; }
    });
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));
  }
}
