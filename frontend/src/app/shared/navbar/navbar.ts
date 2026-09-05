import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SettingsService } from '../../core/settings.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  scrolled = false;
  scrollPct = 0;

  bannerText = '';
  bannerActive = false;
  bannerDismissed = false;
  logoUrl = '/assets/images/navbar-logo.png';

  constructor(private settings: SettingsService) {}

  get bannerVisible(): boolean {
    return this.bannerActive && !!this.bannerText && !this.bannerDismissed;
  }

  ngOnInit(): void {
    this.settings.getSettings().subscribe({
      next: (groups) => {
        const announcement = groups?.['announcement'] ?? [];
        const textEntry = announcement.find((s: any) => s.key === 'announcement.text');
        const activeEntry = announcement.find((s: any) => s.key === 'announcement.active');
        this.bannerText = textEntry?.value ?? '';
        this.bannerActive = activeEntry?.value === 'true';
        this.applyDismissedState();
      },
      error: () => { /* fetch failed — banner stays hidden */ }
    });

    this.settings.getBranding().subscribe({
      next: (branding) => {
        if (branding.logoUrl) this.logoUrl = branding.logoUrl;
      },
      error: () => { /* keep default logo */ }
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
