import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ContentService } from '../../core/content.service';

const AVATAR_COLORS = ['#4285f4','#34a853','#fbbc05','#ea4335','#7b1fa2','#00897b','#e65100','#1565c0'];

interface ApiReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  source: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private content = inject(ContentService);
  private router = inject(Router);

  sections: Record<string, any> = {};

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  isMuted = true;
  scrollCueVisible = true;

  pennineCurrentIndex = 1;
  moorlandCurrentIndex = 1;
  testimonialIndex = 0;

  private pennineTimer: any;
  private moorlandTimer: any;
  private testimonialTimer: any;

  pennineImages = [
    { src: '/assets/images/pennine-suite-exterior.png', alt: 'Pennine Suite Exterior' },
    { src: '/assets/images/pennine-care-drone.png', alt: 'Pennine Suite Interior' },
    { src: '/assets/images/pennine-suite-lounge.png', alt: 'Pennine Suite Lounge' },
    { src: '/assets/images/pennine-suite-hero.png', alt: 'Pennine Suite Scenic Views' }
  ];

  moorlandImages = [
    { src: '/assets/images/pennine-care-entrance.png', alt: 'Moorland Suite Bedroom View' },
    { src: '/assets/images/community-spaces-lounge.png', alt: 'Moorland Suite Lounge Area' },
    { src: '/assets/images/moorland-suite-dining.png', alt: 'Moorland Suite Dining Area' },
    { src: '/assets/images/moorland-suite-garden-exterior.png', alt: 'Moorland Suite Garden Exterior' }
  ];

  testimonials: { initial: string; color: string; name: string; subtitle: string; date: string; text: string }[] = [];

  ngOnInit(): void {
    this.content.getPage('home').subscribe({
      next: (s: any) => {
        this.sections = s;
        if (Array.isArray(s.pennineImages) && s.pennineImages.length > 0) {
          this.pennineImages = s.pennineImages.map((url: string) => ({ src: url, alt: '' }));
        }
        if (Array.isArray(s.moorlandImages) && s.moorlandImages.length > 0) {
          this.moorlandImages = s.moorlandImages.map((url: string) => ({ src: url, alt: '' }));
        }
      },
      error: () => this.router.navigate(['/not-found'])
    });
    this.http.get<ApiReview[]>('http://localhost:3000/api/reviews?visible=true').subscribe({
      next: (reviews) => {
        this.testimonials = reviews.map((r, i) => ({
          initial: r.authorName.charAt(0).toUpperCase(),
          color: AVATAR_COLORS[i % AVATAR_COLORS.length],
          name: r.authorName,
          subtitle: r.source ? `${r.source} Verified Reviewer` : 'Verified Reviewer',
          date: 'Recently',
          text: `"${r.text}"`,
        }));
        if (this.testimonials.length > 0) this.startTestimonialSlider();
      },
      error: () => {
        this.testimonials = [
          { initial: 'K', color: '#4285f4', name: 'Kate T.', subtitle: 'Daughter of Resident • Google Local Guide', date: '2 months ago', text: '"Mum was very resistant to giving up her independence, and the staff have bent over backwards to make this as smooth a transition as possible."' },
        ];
        this.startTestimonialSlider();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initScrollReveal();
    this.startPennineSlider();
    this.startMoorlandSlider();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrollCueVisible = window.scrollY < 80;
  }

  toggleAudio(): void {
    const video = this.heroVideo?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
    this.isMuted = video.muted;
    if (!video.muted && video.paused) {
      video.play().catch(() => { video.muted = true; this.isMuted = true; });
    }
  }

  scrollToSuites(): void {
    document.getElementById('suites')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Pennine slider
  penninePrev(): void {
    this.pennineCurrentIndex = (this.pennineCurrentIndex - 1 + this.pennineImages.length) % this.pennineImages.length;
    this.resetPennineTimer();
  }
  pennineNext(): void {
    this.pennineCurrentIndex = (this.pennineCurrentIndex + 1) % this.pennineImages.length;
    this.resetPennineTimer();
  }
  startPennineSlider(): void {
    this.pennineTimer = setInterval(() => {
      this.pennineCurrentIndex = (this.pennineCurrentIndex + 1) % this.pennineImages.length;
    }, 5500);
  }
  resetPennineTimer(): void {
    clearInterval(this.pennineTimer);
    this.startPennineSlider();
  }

  // Moorland slider
  moorlandPrev(): void {
    this.moorlandCurrentIndex = (this.moorlandCurrentIndex - 1 + this.moorlandImages.length) % this.moorlandImages.length;
    this.resetMoorlandTimer();
  }
  moorlandNext(): void {
    this.moorlandCurrentIndex = (this.moorlandCurrentIndex + 1) % this.moorlandImages.length;
    this.resetMoorlandTimer();
  }
  startMoorlandSlider(): void {
    this.moorlandTimer = setInterval(() => {
      this.moorlandCurrentIndex = (this.moorlandCurrentIndex + 1) % this.moorlandImages.length;
    }, 5500);
  }
  resetMoorlandTimer(): void {
    clearInterval(this.moorlandTimer);
    this.startMoorlandSlider();
  }

  // Testimonial slider
  goToTestimonial(index: number): void {
    this.testimonialIndex = index;
    this.resetTestimonialTimer();
  }
  startTestimonialSlider(): void {
    this.testimonialTimer = setInterval(() => {
      this.testimonialIndex = (this.testimonialIndex + 1) % this.testimonials.length;
    }, 7500);
  }
  resetTestimonialTimer(): void {
    clearInterval(this.testimonialTimer);
    this.startTestimonialSlider();
  }

  initScrollReveal(): void {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-fade-up, .reveal-scale-in, .stagger-container').forEach(el => observer.observe(el));
  }

  ngOnDestroy(): void {
    clearInterval(this.pennineTimer);
    clearInterval(this.moorlandTimer);
    clearInterval(this.testimonialTimer);
  }
}
