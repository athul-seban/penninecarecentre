import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'account', loadComponent: () => import('./pages/account/account').then(m => m.Account) },
      {
        path: 'pages',
        canActivate: [permissionGuard('pages')],
        loadComponent: () => import('./pages/pages-editor/pages-editor').then(m => m.PagesEditor),
      },
      {
        path: 'people',
        canActivate: [permissionGuard('team', 'careers', 'reviews')],
        loadComponent: () => import('./pages/people-manager/people-manager').then(m => m.PeopleManager),
      },
      {
        path: 'team',
        canActivate: [permissionGuard('team')],
        loadComponent: () => import('./pages/team-manager/team-manager').then(m => m.TeamManager),
      },
      {
        path: 'careers',
        canActivate: [permissionGuard('careers')],
        loadComponent: () => import('./pages/careers-manager/careers-manager').then(m => m.CareersManager),
      },
      {
        path: 'reviews',
        canActivate: [permissionGuard('reviews')],
        loadComponent: () => import('./pages/reviews-manager/reviews-manager').then(m => m.ReviewsManager),
      },
      {
        path: 'blog',
        canActivate: [permissionGuard('blog')],
        loadComponent: () => import('./pages/blog-manager/blog-manager').then(m => m.BlogManager),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard('settings')],
        loadComponent: () => import('./pages/settings-editor/settings-editor').then(m => m.SettingsEditor),
      },
      {
        path: 'contact',
        canActivate: [permissionGuard('contact')],
        loadComponent: () => import('./pages/contact-manager/contact-manager').then(m => m.ContactManager),
      },
      {
        path: 'applications',
        canActivate: [permissionGuard('applications')],
        loadComponent: () => import('./pages/applications-manager/applications-manager').then(m => m.ApplicationsManager),
      },
      {
        path: 'users',
        canActivate: [permissionGuard('users')],
        loadComponent: () => import('./pages/users-manager/users-manager').then(m => m.UsersManager),
      },
      {
        path: 'error-logs',
        canActivate: [permissionGuard('errorLogs')],
        loadComponent: () => import('./pages/error-logs/error-logs').then(m => m.ErrorLogs),
      },
      {
        path: 'activity-log',
        canActivate: [permissionGuard('activityLog')],
        loadComponent: () => import('./pages/activity-log/activity-log').then(m => m.ActivityLog),
      },
    ]
  }
];
