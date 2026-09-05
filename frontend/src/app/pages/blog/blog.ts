import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { ContentService } from '../../core/content.service';
import { environment } from '../../../environments/environment';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  createdAt: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class BlogComponent implements OnInit, AfterViewInit {
  posts: BlogPost[] = [];
  loading = true;
  sections: Record<string, string> = {};

  constructor(private http: HttpClient, private seo: SeoService, private content: ContentService) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Blog | Pennine Care Centre',
      description: 'News, updates, and stories from life at Pennine Care Centre in Glossop.',
      path: '/blog',
    });

    this.content.getPage('blog').subscribe({
      next: (s: any) => {
        this.sections = s;
        this.seo.update({
          title: s['metaTitle'] || 'Blog | Pennine Care Centre',
          description: s['metaDescription'] || 'News, updates, and stories from life at Pennine Care Centre in Glossop.',
          path: '/blog',
        });
      },
      error: () => { /* keep static header defaults */ }
    });

    this.http.get<BlogPost[]>(`${environment.apiUrl}/blog?published=true`).subscribe({
      next: (posts) => { this.posts = posts; this.loading = false; },
      error: () => { this.loading = false; }
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
