import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/api';
import { AuthService } from './core/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: []
})
export class App implements OnInit {
  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    // Refresh the stored role/permissions on app load so a permission change an
    // admin made elsewhere takes effect without requiring this user to log out.
    if (!this.auth.getToken()) return;
    this.api.getMe().subscribe({
      next: (user: any) => this.auth.updateUser(user),
      error: () => this.auth.logout(),
    });
  }
}
