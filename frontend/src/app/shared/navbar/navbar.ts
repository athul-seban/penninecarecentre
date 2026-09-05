import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private readonly API = environment.apiUrl;

  menuOpen = false;
  scrolled = false;
  scrollPct = 0;

  bannerText = '';
  bannerActive = false;
  bannerDismissed = false;

  constructor(private http: HttpClient) {}

  get bannerVisible(): boolean {
    return this.bannerActive && !!this.bannerText && !this.bannerDismissed;
  }

  ngOnInit(): void {
    this.http.get<any>(`${this.API}/settings`).subscribe({
      next: (groups) => {
        const announcement = groups?.announcement ?? [];
        const textEntry = announcement.find((s: any) => s.key === 'announcement.text');
        const activeEntry = announcement.find((s: any) => s.key === 'announcement.active');
        this.bannerText = textEntry?.value ?? '';
        this.bannerActive = activeEntry?.value === 'true';
        this.applyDismissedState();
      },
      error: () => { /* fetch failed — banner stays hidden */ }
    });
  }

  private applyDismissedState(): void {
    const dismissedText = localStorage.getItem('announcement-dismissed');
    this.bannerDismissed = dismissedText === this.bannerText;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY;
    this.scrolled = y > 50;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollPct = docH > 0 ? Math.min(100, (y / docH) * 100) : 0;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  dismissBanner(): void {
    this.bannerDismissed = true;
    localStorage.setItem('announcement-dismissed', this.bannerText);
  }
}
