import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pennine-suite',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pennine-suite.html',
  styleUrl: './pennine-suite.css'
})
export class PennineSuiteComponent implements AfterViewInit, OnDestroy {
  sliders: { [key: string]: { images: {src:string,alt:string}[], current: number, timer: any } } = {
    intro: {
      images: [
        { src: 'An Introduction to Tasteful Modernity.PNG', alt: 'Nestling in the beautiful market town of Glossop' },
        { src: 'pennine care 6.PNG', alt: 'Pennine Suite Exterior Drone View' },
        { src: 'pennice drone 2.PNG', alt: 'Pennine Suite Landscape Panorama' }
      ],
      current: 0, timer: null
    },
    community: {
      images: [
        { src: '14.png', alt: 'Warm and Communal Lounge Environment' },
        { src: 'PennineSuite.png', alt: 'Lounge Area View' },
        { src: '27.png', alt: 'Cozy Dining Area' },
        { src: 'IMG_4942.JPG.jpeg', alt: 'Comfort Lounge' },
        { src: '15.png', alt: 'Comfort Lounge 2' }
      ],
      current: 0, timer: null
    },
    bedrooms: {
      images: [
        { src: '11.png', alt: 'Comfortable, Private and Spacious Bedrooms' },
        { src: '12.png', alt: 'Moorland Suite Bedroom View' },
        { src: '17.png', alt: 'Living Spaces' }
      ],
      current: 0, timer: null
    },
    gardens: {
      images: [
        { src: 'PennineSuite2.png', alt: 'Stunning Scenic Garden Landscapes' },
        { src: 'Tranquil Gardens & Outdoors 1.PNG', alt: 'Breathtaking Hills View' },
        { src: 'quality-care.PNG', alt: 'Outdoor Pathways' }
      ],
      current: 0, timer: null
    }
  };

  galleryImages = [
    { src: 'PennineSuite.png', alt: 'Suite Lounge View' },
    { src: 'PennineSuite1.png', alt: 'Dining Room Detail' },
    { src: 'PennineSuite2.png', alt: 'Bedroom Setup' },
    { src: 'PennineSuite3.png', alt: 'Garden Seating' },
    { src: '11.png', alt: 'Living Spaces' },
    { src: '12.png', alt: 'Lounge Area View' },
    { src: '13.png', alt: 'Cozy Dining Area' },
    { src: '14.png', alt: 'Comfort Lounge' },
    { src: '15.png', alt: 'Breathtaking Hills View' },
    { src: '16.png', alt: 'Outdoor Pathways' }
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
