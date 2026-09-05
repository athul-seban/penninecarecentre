import { Component, AfterViewInit, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css'
})
export class PrivacyPolicyComponent implements OnInit, AfterViewInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Privacy Policy | Pennine Care Centre',
      description: 'How Pennine Care Centre collects, stores, and protects personal data, in line with UK GDPR and the Data Protection Act 2018.',
      path: '/privacy-policy',
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

  printPolicy(): void {
    window.print();
  }
}
