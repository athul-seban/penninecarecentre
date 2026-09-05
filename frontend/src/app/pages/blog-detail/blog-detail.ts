import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../core/seo.service';
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
  fallbackImage = '/assets/images/pennine-suite-interior.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/not-found']); return; }

    this.http.get<BlogPost>(`${environment.apiUrl}/blog/${id}`).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
        this.seo.update({
          title: `${post.title} | Pennine Care Centre Blog`,
          description: post.excerpt || post.content?.slice(0, 160),
          path: `/blog/${post.id}`,
          image: post.featuredImage || undefined,
        });
        this.loadRelated(id);
      },
      error: () => this.router.navigate(['/not-found'])
    });
  }

  private loadRelated(id: string): void {
    this.http.get<BlogPost[]>(`${environment.apiUrl}/blog?published=true`).subscribe({
      next: (posts) => {
        const currentIndex = posts.findIndex(p => p.id === id);
        this.relatedPosts = currentIndex === -1 ? [] : this.pickAdjacent(posts, currentIndex, 2, 3);
      },
      error: () => { this.relatedPosts = []; }
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
