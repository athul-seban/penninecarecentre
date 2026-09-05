import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admissions.html',
  styleUrl: './admissions.css'
})
export class AdmissionsComponent implements OnInit, AfterViewInit {
  sections: Record<string, string> = {};
  steps = [1, 2, 3, 4, 5, 6, 7];

  constructor(private content: ContentService, private router: Router, private seo: SeoService) {}

  ngOnInit(): void {
    this.content.getPage('admissions').subscribe({
      next: s => {
        this.sections = s;
        this.seo.update({ title: s['metaTitle'], description: s['metaDescription'], path: '/admissions' });
      },
      error: () => this.router.navigate(['/not-found'])
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));
  }
}
