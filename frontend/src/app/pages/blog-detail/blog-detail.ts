import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SeoService } from '../../core/seo.service';
import { environment } from '../../../environments/environment';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  createdAt: string;
  updatedAt?: string;
}

const REQUEST_TIMEOUT_MS = 15000;

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css'
})
export class BlogDetailComponent implements OnInit {
  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  loading = true;
  loadFailed = false;
  fallbackImage = '/assets/images/pennine-suite-interior.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/not-found']); return; }
    this.loading = true;
    this.loadFailed = false;

    this.http.get<BlogPost>(`${environment.apiUrl}/blog/${id}`).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError(() => of(null)),
    ).subscribe((post) => {
      this.loading = false;
      if (post === null) { this.loadFailed = true; return; }
      this.post = post;
      this.applySeo(post);
      this.loadRelated(id);
    });
  }

  retry(): void {
    this.load();
  }

  private applySeo(post: BlogPost): void {
    this.seo.update({
      title: `${post.title} | Pennine Care Centre Blog`,
      description: post.excerpt || post.content?.slice(0, 160),
      path: `/blog/${post.id}`,
      image: post.featuredImage || undefined,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
    });

    this.seo.updateJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.content?.slice(0, 160),
      image: post.featuredImage ? `https://penninecarecentre.com${post.featuredImage}` : undefined,
      datePublished: post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      mainEntityOfPage: `https://penninecarecentre.com/blog/${post.id}`,
      author: { '@type': 'Organization', name: 'Pennine Care Centre' },
      publisher: {
        '@type': 'Organization',
        name: 'Pennine Care Centre',
        logo: { '@type': 'ImageObject', url: 'https://penninecarecentre.com/assets/images/navbar-logo.png' },
      },
    });
  }

  private loadRelated(id: string): void {
    this.http.get<BlogPost[]>(`${environment.apiUrl}/blog?published=true`).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError(() => of([] as BlogPost[])),
    ).subscribe((posts) => {
      const currentIndex = posts.findIndex(p => p.id === id);
      this.relatedPosts = currentIndex === -1 ? [] : this.pickAdjacent(posts, currentIndex, 2, 3);
    });
  }

  /**
   * Picks posts adjacent to currentIndex in a DESC-sorted (newest-first) list:
   * up to `olderCount` immediately older (higher index) and `newerCount` immediately
   * newer (lower index). If one side runs short, the deficit is filled by extending
   * further into the other side, so the total is still up to olderCount + newerCount.
   */
  private pickAdjacent(posts: BlogPost[], currentIndex: number, olderCount: number, newerCount: number): BlogPost[] {
    const olderAvailable = posts.length - 1 - currentIndex;
    const newerAvailable = currentIndex;

    let takeOlder = Math.min(olderCount, olderAvailable);
    let takeNewer = Math.min(newerCount, newerAvailable);

    let deficit = (olderCount + newerCount) - takeOlder - takeNewer;
    if (deficit > 0) {
      const extraOlder = Math.min(deficit, olderAvailable - takeOlder);
      takeOlder += extraOlder;
      deficit -= extraOlder;
    }
    if (deficit > 0) {
      const extraNewer = Math.min(deficit, newerAvailable - takeNewer);
      takeNewer += extraNewer;
      deficit -= extraNewer;
    }

    const newerPosts = posts.slice(currentIndex - takeNewer, currentIndex);
    const olderPosts = posts.slice(currentIndex + 1, currentIndex + 1 + takeOlder);
    return [...newerPosts, ...olderPosts];
  }
}
