import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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

const REQUEST_TIMEOUT_MS = 15000;

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
  loadFailed = false;
  sections: Record<string, string> = {};
  fallbackImage = '/assets/images/pennine-suite-interior.png';

  constructor(private http: HttpClient, private seo: SeoService, private content: ContentService) {}

  get heroPost(): BlogPost | null {
    return this.posts.length > 0 ? this.posts[0] : null;
  }

  get otherPosts(): BlogPost[] {
    return this.posts.slice(1);
  }

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

    this.http.get<BlogPost[]>(`${environment.apiUrl}/blog?published=true`).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError(() => of(null)),
    ).subscribe((posts) => {
      this.loading = false;
      if (posts === null) { this.loadFailed = true; return; }
      this.posts = posts;
      this.updateJsonLd(posts);
    });
  }

  private updateJsonLd(posts: BlogPost[]): void {
    if (posts.length === 0) { this.seo.updateJsonLd(null); return; }
    this.seo.updateJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Pennine Care Centre Blog',
      url: 'https://penninecarecentre.com/blog',
      blogPost: posts.map(p => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `https://penninecarecentre.com/blog/${p.id}`,
        datePublished: p.createdAt,
        image: p.featuredImage ? `https://penninecarecentre.com${p.featuredImage}` : undefined,
      })),
    });
  }

  retry(): void {
    this.loading = true;
    this.loadFailed = false;
    this.ngOnInit();
  }

  excerptFor(post: BlogPost): string {
    if (post.excerpt) return post.excerpt;
    const text = post.content || '';
    return text.length > 160 ? text.slice(0, 160).trim() + '…' : text;
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
