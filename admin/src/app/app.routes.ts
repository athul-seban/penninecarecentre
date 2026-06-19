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
      { path: 'team', loadComponent: () => import('./pages/team-manager/team-manager').then(m => m.TeamManager) },
      { path: 'careers', loadComponent: () => import('./pages/careers-manager/careers-manager').then(m => m.CareersManager) },
      { path: 'reviews', loadComponent: () => import('./pages/reviews-manager/reviews-manager').then(m => m.ReviewsManager) },
      { path: 'settings', loadComponent: () => import('./pages/settings-editor/settings-editor').then(m => m.SettingsEditor) },
      { path: 'media', loadComponent: () => import('./pages/media-library/media-library').then(m => m.MediaLibrary) },
      { path: 'contact', loadComponent: () => import('./pages/contact-manager/contact-manager').then(m => m.ContactManager) },
      { path: 'error-logs', loadComponent: () => import('./pages/error-logs/error-logs').then(m => m.ErrorLogs) },
    ]
  }
];
