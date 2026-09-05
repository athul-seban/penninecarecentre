import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { ThemeService } from './core/theme.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Pennine Care Centre';

  constructor(private theme: ThemeService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.theme.applyActiveTheme();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      const nav = e as NavigationEnd;
      this.theme.applyActiveTheme();
      this.http.post(`${environment.apiUrl}/analytics/track`, {
        path: nav.urlAfterRedirects,
        referrer: document.referrer || undefined,
      }).pipe(catchError(() => EMPTY)).subscribe();
    });
  }
}
