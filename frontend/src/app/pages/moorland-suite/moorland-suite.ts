import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-moorland-suite',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './moorland-suite.html',
  styleUrl: './moorland-suite.css'
})
export class MoorlandSuiteComponent implements AfterViewInit, OnDestroy {
  sliders: { [key: string]: { images: {src:string,alt:string}[], current: number, timer: any } } = {
    haven: {
      images: [
        { src: '/assets/images/community-spaces-lounge.png', alt: 'Life at Moorland Suite' },
        { src: '/assets/images/moorland-suite-garden.png', alt: 'Moorland Suite Garden Exterior' },
        { src: '/assets/images/pennine-care-entrance.png', alt: 'Moorland Suite Entrance Path' }
      ],
      current: 0, timer: null
    },
    spaces: {
      images: [
        { src: '/assets/images/moorland-suite-community.png', alt: 'Moorland Suite Community Spaces' },
        { src: '/assets/images/moorland-suite-lounge.png', alt: 'Moorland Suite Lounge Area' },
        { src: '/assets/images/community-spaces-dining.png', alt: 'Moorland Suite Dining Area' }
      ],
      current: 0, timer: null
    },
    bedrooms: {
      images: [
        { src: '/assets/images/moorland-suite-bedroom.png', alt: 'Tailored Spacious Bedrooms' },
        { src: '/assets/images/moorland-suite-lounge-2.png', alt: 'Moorland Suite Cozy Bedroom' },
        { src: '/assets/images/moorland-suite-corridor.png', alt: 'Moorland Suite Scenic Room View' }
      ],
      current: 0, timer: null
    },
    gardens: {
      images: [
        { src: '/assets/images/moorland-suite-gardens.png', alt: 'Scenic Peak District Gardens' },
        { src: '/assets/images/moorland-suite-patio.png', alt: 'Moorland Suite Secure Patio Area' },
        { src: '/assets/images/moorland-suite-outdoor.png', alt: 'Outdoor Relaxation Spaces' }
      ],
      current: 0, timer: null
    }
  };

  galleryImages = [
    { src: '/assets/images/moorland-suite-lounge-2.png', alt: 'Moorland Suite Lounge' },
    { src: '/assets/images/moorland-suite-lounge.png', alt: 'Moorland Suite Bedroom' },
    { src: '/assets/images/moorland-suite-corridor.png', alt: 'Moorland Suite Corridors' },
    { src: '/assets/images/moorland-suite-garden.png', alt: 'Moorland Suite Dining' },
    { src: '/assets/images/moorland-suite-gardens-2.png', alt: 'Moorland Suite Gardens' },
    { src: '/assets/images/moorland-suite-bedroom.png', alt: 'Scenic Overlook' },
    { src: '/assets/images/pennine-suite-dining.png', alt: 'Quiet Room' }
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

  get itemsPerView(): number { return window.innerWidth > 968 ? 3 : 1; }
  get maxGallerySlides(): number { return Math.ceil(this.galleryImages.length / this.itemsPerView); }

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
