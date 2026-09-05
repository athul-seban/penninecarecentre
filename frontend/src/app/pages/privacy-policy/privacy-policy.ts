import { Component, AfterViewInit, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';
import { ContentService } from '../../core/content.service';
import { SettingsService } from '../../core/settings.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css'
})
export class PrivacyPolicyComponent implements OnInit, AfterViewInit {
  // A legal/compliance page must always render, so a content-fetch failure is
  // ignored here (unlike other pages) rather than redirecting to /not-found.
  sections: Record<string, string> = {};
  address = 'Turnlee Road, Glossop, Derbyshire, SK13 6JW';
  email = 'Admin@nyms-services.com';

  constructor(private seo: SeoService, private content: ContentService, private settings: SettingsService) {}

  ngOnInit(): void {
    this.settings.getContactInfo().subscribe({
      next: (info) => {
        if (info.address) this.address = info.address;
        if (info.email) this.email = info.email;
      },
      error: () => { /* keep defaults */ }
    });
    this.seo.update({
      title: 'Privacy Policy | Pennine Care Centre',
      description: 'How Pennine Care Centre collects, stores, and protects personal data, in line with UK GDPR and the Data Protection Act 2018.',
      path: '/privacy-policy',
    });

    this.content.getPage('privacy-policy').subscribe({
      next: (s: any) => {
        this.sections = s;
        if (s['metaTitle'] || s['metaDescription']) {
          this.seo.update({
            title: s['metaTitle'] || 'Privacy Policy | Pennine Care Centre',
            description: s['metaDescription'] || 'How Pennine Care Centre collects, stores, and protects personal data, in line with UK GDPR and the Data Protection Act 2018.',
            path: '/privacy-policy',
          });
        }
      },
      error: () => { /* keep static defaults */ }
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
