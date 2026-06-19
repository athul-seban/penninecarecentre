import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const THEMES = [
  { id: 'classic', label: 'Classic',      description: 'Navy & Gold — timeless, professional',   swatch: ['#002b5b','#c5a059','#faf9f6'] },
  { id: 'modern',  label: 'Modern Dark',  description: 'Near-black with electric cyan',            swatch: ['#0d0d1a','#00d4ff','#161628'] },
  { id: 'sage',    label: 'Warm Sage',    description: 'Forest green with warm copper tones',      swatch: ['#2a4523','#b8925a','#f4f0e6'] },
  { id: 'rose',    label: 'Rose & Slate', description: 'Slate blue with dusty rose accents',       swatch: ['#2c3e50','#c27b6e','#fdf6f4'] },
  { id: 'royal',   label: 'Royal Purple', description: 'Deep violet with soft lavender highlights', swatch: ['#2d1b69','#9b7ed4','#f7f4ff'] },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly API = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /** Fetch active theme from backend and apply it */
  applyActiveTheme(): void {
    // Apply stored theme immediately to avoid flash
    const stored = localStorage.getItem('site_theme') ?? 'classic';
    this.applyTheme(stored);

    this.http.get<any>(`${this.API}/settings`).subscribe({
      next: (groups) => {
        const themeEntry = groups?.theme?.find((s: any) => s.key === 'site.theme');
        if (themeEntry?.value) {
          this.applyTheme(themeEntry.value);
          localStorage.setItem('site_theme', themeEntry.value);
        }
      },
      error: () => { /* use stored value on error */ }
    });
  }

  applyTheme(themeId: string): void {
    document.body.setAttribute('data-theme', themeId);
  }

  getActiveTheme(): string {
    return document.body.getAttribute('data-theme') ?? 'classic';
  }
}
