import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';

interface FaqItem {
  key: string;
  question: string;
  answer: string;
}

const FAQ_KEYS: { key: string; question: string; answer: string }[] = [
  { key: 'visiting', question: 'What are your visiting arrangements?', answer: 'We welcome visitors and operate a flexible visiting policy so families can stay closely involved in their loved one\'s life. Please contact us to arrange a convenient time to visit.' },
  { key: 'bring', question: 'What should we bring when a loved one moves in?', answer: 'We recommend bringing a small selection of clothing, favourite personal items, and any photographs or keepsakes that will help your loved one feel at home. Our team can provide a full moving-in checklist.' },
  { key: 'bedrooms', question: 'Can bedrooms be personalised?', answer: 'Yes — residents are warmly encouraged to personalise their bedroom with their own furniture, photographs, and cherished belongings, helping the space feel like home.' },
  { key: 'medication', question: 'How is medication managed?', answer: 'Our trained care team support residents with medication administration as part of their individual care plan, working closely with GPs and pharmacists.' },
  { key: 'dietary', question: 'Can you cater for specific dietary requirements?', answer: 'Our catering team prepares balanced, nutritious meals tailored to individual tastes, preferences, and any dietary or medical requirements.' },
  { key: 'activities', question: 'What activities are available?', answer: 'Our activities team runs a varied weekly programme including music, arts and crafts, gentle exercise, and outings, tailored to individual interests and abilities.' },
  { key: 'laundry', question: 'Is laundry included?', answer: 'Laundry services are included as part of our care package, with residents\' clothing cared for by our housekeeping team.' },
  { key: 'appointments', question: 'Can you help with medical appointments?', answer: 'Our team can support residents in attending medical and other appointments — please speak to us about arranging escorted visits.' },
  { key: 'respite', question: 'Do you offer respite (short-term) stays?', answer: 'We offer short-term respite stays where availability allows, giving families a trusted break with the reassurance of professional care. Please contact us to check current availability.' },
  { key: 'pets', question: 'Are pets allowed to visit?', answer: 'We understand how much pets can mean to our residents and are happy to discuss visiting pets or other arrangements — please get in touch to talk through your loved one\'s circumstances.' },
  { key: 'smoking', question: 'What are the arrangements for smoking?', answer: 'For the safety and comfort of all residents and staff, smoking is only permitted in designated outdoor areas. Please ask a member of our team for details.' },
  { key: 'wifi', question: 'Is Wi-Fi and television available?', answer: 'Wi-Fi and television are available throughout the home, including in communal lounges and bedrooms.' },
  { key: 'admissions', question: 'How does the admissions process work?', answer: 'We guide every family through a clear, step-by-step process from initial enquiry to settling in. Visit our Admissions & Referrals page for full details.' },
  { key: 'fees', question: 'How much does care cost, and how is it funded?', answer: 'Fees vary depending on individual care needs and funding route. Visit our Fees & Funding page for an overview of how care can be funded and what is typically included.' },
  { key: 'concern', question: 'How do I raise a concern?', answer: 'We take all feedback seriously. Please speak to a member of the care team or the Home Manager in the first instance, or contact us using the details on our Contact page. Our full complaints procedure is available on request.' },
];

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqComponent implements OnInit, AfterViewInit {
  sections: Record<string, string> = {};
  faqItems: FaqItem[] = [];
  openIndex: number | null = 0;

  constructor(private content: ContentService, private router: Router) {}

  ngOnInit(): void {
    this.content.getPage('faq').subscribe({
      next: s => {
        this.sections = s;
        this.faqItems = FAQ_KEYS.map(item => ({
          key: item.key,
          question: s[`${item.key}Q`] || item.question,
          answer: s[`${item.key}A`] || item.answer,
        }));
      },
      error: () => this.router.navigate(['/not-found'])
    });
  }

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));
  }
}
