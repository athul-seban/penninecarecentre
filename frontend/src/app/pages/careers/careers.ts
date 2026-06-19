import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './careers.html',
  styleUrl: './careers.css'
})
export class CareersComponent implements AfterViewInit {
  applicationForm = {
    fullName: '',
    email: '',
    phone: '',
    position: '',
    coverLetter: '',
    cvFileName: ''
  };

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
      this.applicationForm.cvFileName = input.files[0].name;
    }
  }

  scrollToForm(position: string): void {
    this.applicationForm.position = position;
    const el = document.getElementById('applyForm');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  onSubmit(): void {
    console.log('Application submitted:', this.applicationForm);
    // Backend integration pending
  }
}
