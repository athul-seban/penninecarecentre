import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE}/auth/login`, { email, password });
  }

  // Pages
  getPages(): Observable<any> {
    return this.http.get(`${this.BASE}/pages`, { headers: this.auth.getHeaders() });
  }
  updatePage(key: string, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/pages/${key}`, data, { headers: this.auth.getHeaders() });
  }

  // Team
  getTeam(): Observable<any> {
    return this.http.get(`${this.BASE}/team`, { headers: this.auth.getHeaders() });
  }
  createTeamMember(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/team`, data, { headers: this.auth.getHeaders() });
  }
  updateTeamMember(id: string, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/team/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteTeamMember(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/team/${id}`, { headers: this.auth.getHeaders() });
  }

  // Careers
  getCareers(): Observable<any> {
    return this.http.get(`${this.BASE}/careers`, { headers: this.auth.getHeaders() });
  }
  createCareer(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/careers`, data, { headers: this.auth.getHeaders() });
  }
  updateCareer(id: string, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/careers/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteCareer(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/careers/${id}`, { headers: this.auth.getHeaders() });
  }

  // Reviews
  getReviews(): Observable<any> {
    return this.http.get(`${this.BASE}/reviews`, { headers: this.auth.getHeaders() });
  }
  createReview(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/reviews`, data, { headers: this.auth.getHeaders() });
  }
  updateReview(id: string, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/reviews/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/reviews/${id}`, { headers: this.auth.getHeaders() });
  }

  // Settings
  getSettings(): Observable<any> {
    return this.http.get(`${this.BASE}/settings`, { headers: this.auth.getHeaders() });
  }
  updateSettings(updates: any): Observable<any> {
    return this.http.put(`${this.BASE}/settings`, updates, { headers: this.auth.getHeaders() });
  }

  // Media
  getMedia(): Observable<any> {
    return this.http.get(`${this.BASE}/media`, { headers: this.auth.getHeaders() });
  }
  uploadMedia(formData: FormData): Observable<any> {
    const token = this.auth.getToken();
    return this.http.post(`${this.BASE}/media`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  deleteMedia(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/media/${id}`, { headers: this.auth.getHeaders() });
  }
}
