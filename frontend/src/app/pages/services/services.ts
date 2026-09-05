import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class ServicesComponent implements OnInit, AfterViewInit {
  sections: Record<string, string> = {};

  constructor(private content: ContentService, private router: Router, private seo: SeoService) {}

  ngOnInit(): void {
    this.content.getPage('services').subscribe({
      next: s => {
        this.sections = s;
        this.seo.update({ title: s['metaTitle'], description: s['metaDescription'], path: '/services' });
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
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));
  }
}
