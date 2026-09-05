import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private buildQuery(params: Record<string, any> = {}): string {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') usp.set(key, String(value));
    });
    const qs = usp.toString();
    return qs ? `?${qs}` : '';
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE}/auth/login`, { email, password });
  }

  getMe(): Observable<any> {
    return this.http.post(`${this.BASE}/auth/me`, {}, { headers: this.auth.getHeaders() });
  }

  updateProfile(data: { name?: string; email?: string }): Observable<any> {
    return this.http.put(`${this.BASE}/auth/profile`, data, { headers: this.auth.getHeaders() });
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.BASE}/auth/change-password`, data, { headers: this.auth.getHeaders() });
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.BASE}/users`, { headers: this.auth.getHeaders() });
  }
  createUser(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/users`, data, { headers: this.auth.getHeaders() });
  }
  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/users/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/users/${id}`, { headers: this.auth.getHeaders() });
  }

  // Roles
  getRoles(): Observable<any> {
    return this.http.get(`${this.BASE}/roles`, { headers: this.auth.getHeaders() });
  }
  getPermissionKeys(): Observable<any> {
    return this.http.get(`${this.BASE}/roles/permissions`, { headers: this.auth.getHeaders() });
  }
  createRole(data: { name: string; permissions: string[] }): Observable<any> {
    return this.http.post(`${this.BASE}/roles`, data, { headers: this.auth.getHeaders() });
  }
  updateRole(id: string, data: { name?: string; permissions?: string[] }): Observable<any> {
    return this.http.put(`${this.BASE}/roles/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/roles/${id}`, { headers: this.auth.getHeaders() });
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

  // Blog
  getBlogPosts(params: { page?: number; pageSize?: number; status?: string; q?: string } = {}): Observable<any> {
    return this.http.get(`${this.BASE}/blog/admin${this.buildQuery(params)}`, { headers: this.auth.getHeaders() });
  }
  createBlogPost(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/blog`, data, { headers: this.auth.getHeaders() });
  }
  updateBlogPost(id: string, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/blog/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteBlogPost(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/blog/${id}`, { headers: this.auth.getHeaders() });
  }

  // Settings
  getSettings(): Observable<any> {
    return this.http.get(`${this.BASE}/settings/admin`, { headers: this.auth.getHeaders() });
  }
  updateSettings(updates: any): Observable<any> {
    return this.http.put(`${this.BASE}/settings`, updates, { headers: this.auth.getHeaders() });
  }

  // Contact Submissions
  getContactSubmissions(params: { page?: number; pageSize?: number; status?: string; from?: string; to?: string } = {}): Observable<any> {
    return this.http.get(`${this.BASE}/contact${this.buildQuery(params)}`, { headers: this.auth.getHeaders() });
  }
  updateContactSubmission(id: string, data: { status: string; notes?: string }): Observable<any> {
    return this.http.patch(`${this.BASE}/contact/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteContactSubmission(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/contact/${id}`, { headers: this.auth.getHeaders() });
  }
  replyToContact(id: string, data: { subject: string; message: string }): Observable<any> {
    return this.http.post(`${this.BASE}/contact/${id}/reply`, data, { headers: this.auth.getHeaders() });
  }

  // Job Applications
  getApplications(params: { page?: number; pageSize?: number; status?: string; from?: string; to?: string } = {}): Observable<any> {
    return this.http.get(`${this.BASE}/applications${this.buildQuery(params)}`, { headers: this.auth.getHeaders() });
  }
  updateApplication(id: string, data: { status: string; notes?: string }): Observable<any> {
    return this.http.patch(`${this.BASE}/applications/${id}`, data, { headers: this.auth.getHeaders() });
  }
  deleteApplication(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/applications/${id}`, { headers: this.auth.getHeaders() });
  }
  replyToApplication(id: string, data: { subject: string; message: string }): Observable<any> {
    return this.http.post(`${this.BASE}/applications/${id}/reply`, data, { headers: this.auth.getHeaders() });
  }

  // Error Logs
  getErrorLogs(params: { page?: number; pageSize?: number; method?: string; statusCode?: number; from?: string; to?: string; q?: string } = {}): Observable<any> {
    return this.http.get(`${this.BASE}/error-logs${this.buildQuery(params)}`, { headers: this.auth.getHeaders() });
  }
  clearErrorLogs(): Observable<any> {
    return this.http.delete(`${this.BASE}/error-logs`, { headers: this.auth.getHeaders() });
  }

  // Activity Log (per-user audit trail)
  getAuditLogs(params: { page?: number; pageSize?: number; method?: string; from?: string; to?: string; q?: string } = {}): Observable<any> {
    return this.http.get(`${this.BASE}/audit-logs${this.buildQuery(params)}`, { headers: this.auth.getHeaders() });
  }
  clearAuditLogs(): Observable<any> {
    return this.http.delete(`${this.BASE}/audit-logs`, { headers: this.auth.getHeaders() });
  }

  // Analytics
  getAnalytics(): Observable<any> {
    return this.http.get(`${this.BASE}/analytics`, { headers: this.auth.getHeaders() });
  }
  getAnalyticsReport(from: string, to: string): Observable<any> {
    return this.http.get(`${this.BASE}/analytics/report?from=${from}&to=${to}`, { headers: this.auth.getHeaders() });
  }

  // Media
  uploadMedia(formData: FormData): Observable<any> {
    const token = this.auth.getToken();
    return this.http.post(`${this.BASE}/media/upload`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
