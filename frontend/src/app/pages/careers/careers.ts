import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ContentService } from '../../core/content.service';
import { SeoService } from '../../core/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './careers.html',
  styleUrl: './careers.css'
})
export class CareersComponent implements OnInit, AfterViewInit {
  sections: Record<string, string> = {};
  jobs: any[] = [];

  applicationForm = {
    fullName: '',
    email: '',
    phone: '',
    position: '',
    coverLetter: '',
    cvFileName: ''
  };

  cvFile: File | null = null;
  submitting = false;
  submitted = false;
  submitError = '';

  constructor(private http: HttpClient, private content: ContentService, private router: Router, private seo: SeoService) {}

  ngOnInit(): void {
    this.content.getPage('careers').subscribe({
      next: s => {
        this.sections = s;
        this.seo.update({ title: s['metaTitle'], description: s['metaDescription'], path: '/careers' });
      },
      error: () => this.router.navigate(['/not-found'])
    });
    this.http.get<any[]>(`${environment.apiUrl}/careers`).subscribe({
      next: (jobs) => { this.jobs = jobs.filter(j => j.isOpen); },
      error: () => {}
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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.cvFile = input.files[0];
      this.applicationForm.cvFileName = input.files[0].name;
    }
  }

  scrollToForm(position: string): void {
    this.applicationForm.position = position;
    const el = document.getElementById('applyForm');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  onSubmit(): void {
    this.submitting = true;
    this.submitError = '';

    const fd = new FormData();
    fd.append('fullName', this.applicationForm.fullName);
    fd.append('email', this.applicationForm.email);
    fd.append('phone', this.applicationForm.phone);
    fd.append('position', this.applicationForm.position);
    fd.append('coverLetter', this.applicationForm.coverLetter);
    if (this.cvFile) {
      fd.append('cvFile', this.cvFile, this.cvFile.name);
    }

    this.http.post(`${environment.apiUrl}/applications`, fd).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.applicationForm = { fullName: '', email: '', phone: '', position: '', coverLetter: '', cvFileName: '' };
        this.cvFile = null;
      },
      error: () => {
        this.submitting = false;
        this.submitError = 'Something went wrong. Please try again or call us directly.';
      }
    });
  }
}
