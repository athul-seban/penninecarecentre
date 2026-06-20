import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent implements OnInit, AfterViewInit {
  sections: Record<string, string> = {};
  contactForm = { name: '', email: '', phone: '', subject: '', message: '' };
  submitting = false;
  submitted = false;
  submitError = '';

  constructor(private http: HttpClient, private content: ContentService, private router: Router) {}

  ngOnInit(): void {
    this.content.getPage('contact').subscribe({
      next: s => { this.sections = s; },
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

  onSubmit(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.submitError = '';
    this.http.post('http://localhost:3000/api/contact', this.contactForm).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.contactForm = { name: '', email: '', phone: '', subject: '', message: '' };
      },
      error: () => {
        this.submitting = false;
        this.submitError = 'Sorry, there was a problem sending your message. Please try again or call us directly.';
      }
    });
  }
}
