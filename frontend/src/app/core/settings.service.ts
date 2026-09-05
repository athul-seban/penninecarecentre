import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

/** Converts a UK local-format number (e.g. "01457 862466") to a dialable tel: href (e.g. "+441457862466"). */
export function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') ? `+44${digits.slice(1)}` : digits;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly API = environment.apiUrl;
  private cache$: Observable<Record<string, any[]>> | null = null;

  constructor(private http: HttpClient) {}

  /** Fetches GET /api/settings once and shares the result with every caller (navbar, footer, etc.) instead of each issuing its own request. */
  getSettings(): Observable<Record<string, any[]>> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Record<string, any[]>>(`${this.API}/settings`).pipe(
        shareReplay(1),
        catchError((err) => {
          this.cache$ = null;
          throw err;
        }),
      );
    }
    return this.cache$;
  }

  /** Convenience accessor for the sitewide phone/email/address used across the footer, 404 page, and privacy policy. */
  getContactInfo(): Observable<ContactInfo> {
    return this.getSettings().pipe(
      map((groups) => {
        const contact = groups?.['contact'] ?? [];
        const find = (key: string) => contact.find((s: any) => s.key === key)?.value;
        return {
          phone: find('site.phone') ?? '',
          email: find('site.email') ?? '',
          address: find('site.address') ?? '',
        };
      }),
    );
  }
}
