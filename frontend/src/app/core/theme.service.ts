import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly API = environment.apiUrl;

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
}
