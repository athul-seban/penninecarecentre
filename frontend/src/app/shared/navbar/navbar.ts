import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  bannerVisible = true;

  ngOnInit(): void {
    const dismissed = localStorage.getItem('announcement-dismissed');
    if (dismissed === 'true') {
      this.bannerVisible = false;
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 50;
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
    this.bannerVisible = false;
    localStorage.setItem('announcement-dismissed', 'true');
  }
}
