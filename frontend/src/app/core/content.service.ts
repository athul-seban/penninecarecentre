import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly API = environment.apiUrl;
  private cache = new Map<string, Observable<Record<string, any>>>();

  constructor(private http: HttpClient) {}

  getPage(pageKey: string): Observable<Record<string, any>> {
    if (!this.cache.has(pageKey)) {
      const req = this.http.get<any>(`${this.API}/pages/${pageKey}`).pipe(
        map(p => p.sections ?? {}),
        shareReplay(1),
      );
      this.cache.set(pageKey, req);
    }
    return this.cache.get(pageKey)!.pipe(
      catchError(err => {
        this.cache.delete(pageKey);
        throw err;
      })
    );
  }
}
