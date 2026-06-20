import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly API = 'http://localhost:3000/api';
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
