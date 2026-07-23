import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-fees-funding',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fees-funding.html',
  styleUrl: './fees-funding.css'
})
export class FeesFundingComponent implements OnInit, AfterViewInit {
  sections: Record<string, string> = {};

  constructor(private content: ContentService, private router: Router) {}

  ngOnInit(): void {
    this.content.getPage('fees-funding').subscribe({
      next: s => { this.sections = s; },
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
