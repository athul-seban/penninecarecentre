import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  isMuted = true;

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

  testimonials = [
    { initial: 'K', color: '#4285f4', name: 'Kate T.', subtitle: 'Daughter of Resident • Google Local Guide', date: '2 months ago', text: '"Mum was very resistant to giving up her independence, and the staff have bent over backwards to make this as smooth a transition as possible."' },
    { initial: 'N', color: '#34a853', name: 'Nigel B.', subtitle: 'Son of Resident • Google Verified Reviewer', date: '3 weeks ago', text: '"My mum has been a resident for 6 weeks and I am very happy with the care she is receiving. Congratulations on your CQC rating of good."' },
    { initial: 'S', color: '#fbbc05', name: 'Susan S.', subtitle: 'Wife of Resident • Google Verified Reviewer', date: '1 month ago', text: '"I find everyone from the domestics to the carers very helpful. I know he is being cared for and that makes me feel happier."' },
    { initial: 'A', color: '#ea4335', name: 'Amber L.', subtitle: 'Daughter of Resident • Google Verified Reviewer', date: '2 weeks ago', text: '"The management and staff have been absolutely wonderful. They keep us updated constantly, and the level of care and empathy shown to my dad is exemplary. We could not have chosen a better place."' },
    { initial: 'M', color: '#7b1fa2', name: 'Mark W.', subtitle: 'Nephew of Resident • Google Verified Reviewer', date: '3 months ago', text: '"Excellent care home with fantastic, dedicated staff who genuinely care. The facilities are modern, clean, and very welcoming. My uncle is settled and very content here."' }
  ];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScrollReveal();
    this.startPennineSlider();
    this.startMoorlandSlider();
    this.startTestimonialSlider();
  }

  toggleAudio(): void {
    if (this.heroVideo?.nativeElement) {
      this.heroVideo.nativeElement.muted = !this.heroVideo.nativeElement.muted;
      this.isMuted = this.heroVideo.nativeElement.muted;
    }
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
