import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'pages', loadComponent: () => import('./pages/pages-editor/pages-editor').then(m => m.PagesEditor) },
      { path: 'people', loadComponent: () => import('./pages/people-manager/people-manager').then(m => m.PeopleManager) },
      { path: 'team', loadComponent: () => import('./pages/team-manager/team-manager').then(m => m.TeamManager) },
      { path: 'careers', loadComponent: () => import('./pages/careers-manager/careers-manager').then(m => m.CareersManager) },
      { path: 'reviews', loadComponent: () => import('./pages/reviews-manager/reviews-manager').then(m => m.ReviewsManager) },
      { path: 'blog', loadComponent: () => import('./pages/blog-manager/blog-manager').then(m => m.BlogManager) },
      { path: 'settings', loadComponent: () => import('./pages/settings-editor/settings-editor').then(m => m.SettingsEditor) },
      { path: 'contact', loadComponent: () => import('./pages/contact-manager/contact-manager').then(m => m.ContactManager) },
      { path: 'applications', loadComponent: () => import('./pages/applications-manager/applications-manager').then(m => m.ApplicationsManager) },
      { path: 'error-logs', loadComponent: () => import('./pages/error-logs/error-logs').then(m => m.ErrorLogs) },
    ]
  }
];
