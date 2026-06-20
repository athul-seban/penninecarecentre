import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-pennine-suite',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pennine-suite.html',
  styleUrl: './pennine-suite.css'
})
export class PennineSuiteComponent implements OnInit, AfterViewInit, OnDestroy {
  sections: Record<string, any> = {};

  constructor(private content: ContentService, private router: Router) {}

  ngOnInit(): void {
    this.content.getPage('pennine-suite').subscribe({
      next: (s: any) => {
        this.sections = s;
        if (Array.isArray(s.introImages) && s.introImages.length > 0)
          this.sliders.intro.images = s.introImages.map((u: string) => ({ src: u, alt: '' }));
        if (Array.isArray(s.communityImages) && s.communityImages.length > 0)
          this.sliders.community.images = s.communityImages.map((u: string) => ({ src: u, alt: '' }));
        if (Array.isArray(s.bedroomImages) && s.bedroomImages.length > 0)
          this.sliders.bedrooms.images = s.bedroomImages.map((u: string) => ({ src: u, alt: '' }));
        if (Array.isArray(s.gardenImages) && s.gardenImages.length > 0)
          this.sliders.gardens.images = s.gardenImages.map((u: string) => ({ src: u, alt: '' }));
        if (Array.isArray(s.galleryImages) && s.galleryImages.length > 0)
          this.galleryImages = s.galleryImages.map((u: string) => ({ src: u, alt: '' }));
      },
      error: () => this.router.navigate(['/not-found'])
    });
  }

  sliders: Record<string, { images: {src:string,alt:string}[], current: number, timer: any }> & {
    intro: { images: {src:string,alt:string}[], current: number, timer: any };
    community: { images: {src:string,alt:string}[], current: number, timer: any };
    bedrooms: { images: {src:string,alt:string}[], current: number, timer: any };
    gardens: { images: {src:string,alt:string}[], current: number, timer: any };
  } = {
    intro: {
      images: [
        { src: '/assets/images/pennine-suite-intro.png', alt: 'Nestling in the beautiful market town of Glossop' },
        { src: '/assets/images/pennine-suite-exterior.png', alt: 'Pennine Suite Exterior Drone View' },
        { src: '/assets/images/pennine-care-drone.png', alt: 'Pennine Suite Landscape Panorama' }
      ],
      current: 0, timer: null
    },
    community: {
      images: [
        { src: '/assets/images/pennine-suite-communal-lounge.png', alt: 'Warm and Communal Lounge Environment' },
        { src: '/assets/images/pennine-suite-quality-care.png', alt: 'Lounge Area View' },
        { src: '/assets/images/pennine-suite-dining.png', alt: 'Cozy Dining Area' },
        { src: '/assets/images/pennine-suite-comfort-lounge.jpg', alt: 'Comfort Lounge' },
        { src: '/assets/images/pennine-suite-comfort-lounge-2.png', alt: 'Comfort Lounge 2' }
      ],
      current: 0, timer: null
    },
    bedrooms: {
      images: [
        { src: '/assets/images/pennine-suite-bedroom.png', alt: 'Comfortable, Private and Spacious Bedrooms' },
        { src: '/assets/images/pennine-suite-bedroom-2.png', alt: 'Pennine Suite Bedroom View' },
        { src: '/assets/images/pennine-suite-living-spaces.png', alt: 'Living Spaces' }
      ],
      current: 0, timer: null
    },
    gardens: {
      images: [
        { src: '/assets/images/pennine-suite-lounge.png', alt: 'Stunning Scenic Garden Landscapes' },
        { src: '/assets/images/pennine-suite-gardens.png', alt: 'Breathtaking Hills View' },
        { src: '/assets/images/pennine-suite-outdoor-pathways.png', alt: 'Outdoor Pathways' }
      ],
      current: 0, timer: null
    }
  };

  galleryImages = [
    { src: '/assets/images/pennine-suite-quality-care.png', alt: 'Suite Lounge View' },
    { src: '/assets/images/pennine-suite-interior.png', alt: 'Dining Room Detail' },
    { src: '/assets/images/pennine-suite-lounge.png', alt: 'Bedroom Setup' },
    { src: '/assets/images/pennine-suite-garden-seating.png', alt: 'Garden Seating' },
    { src: '/assets/images/pennine-suite-bedroom.png', alt: 'Living Spaces' },
    { src: '/assets/images/pennine-suite-bedroom-2.png', alt: 'Lounge Area View' },
    { src: '/assets/images/pennine-suite-dining-2.png', alt: 'Cozy Dining Area' },
    { src: '/assets/images/pennine-suite-communal-lounge.png', alt: 'Comfort Lounge' },
    { src: '/assets/images/pennine-suite-comfort-lounge-2.png', alt: 'Breathtaking Hills View' },
    { src: '/assets/images/pennine-suite-outdoor-pathways-2.png', alt: 'Outdoor Pathways' }
  ];

  gallerySlide = 0;
  private galleryTimer: any;

  ngAfterViewInit(): void {
    this.initScrollReveal();
    Object.keys(this.sliders).forEach(key => this.startSlider(key));
    this.startGalleryTimer();
  }

  ngOnDestroy(): void {
    Object.values(this.sliders).forEach(s => clearInterval(s.timer));
    clearInterval(this.galleryTimer);
  }

  startSlider(key: string): void {
    const s = this.sliders[key];
    s.timer = setInterval(() => {
      s.current = (s.current + 1) % s.images.length;
    }, 5500);
  }

  prevSlide(key: string): void {
    const s = this.sliders[key];
    s.current = (s.current - 1 + s.images.length) % s.images.length;
    clearInterval(s.timer);
    this.startSlider(key);
  }

  nextSlide(key: string): void {
    const s = this.sliders[key];
    s.current = (s.current + 1) % s.images.length;
    clearInterval(s.timer);
    this.startSlider(key);
  }

  get itemsPerView(): number {
    return window.innerWidth > 968 ? 3 : 1;
  }

  get maxGallerySlides(): number {
    return Math.ceil(this.galleryImages.length / this.itemsPerView);
  }

  prevGallery(): void {
    this.gallerySlide = (this.gallerySlide - 1 + this.maxGallerySlides) % this.maxGallerySlides;
    this.resetGalleryTimer();
  }

  nextGallery(): void {
    this.gallerySlide = (this.gallerySlide + 1) % this.maxGallerySlides;
    this.resetGalleryTimer();
  }

  startGalleryTimer(): void {
    this.galleryTimer = setInterval(() => {
      this.gallerySlide = (this.gallerySlide + 1) % this.maxGallerySlides;
    }, 6000);
  }

  resetGalleryTimer(): void {
    clearInterval(this.galleryTimer);
    this.startGalleryTimer();
  }

  initScrollReveal(): void {
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
