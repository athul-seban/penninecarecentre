import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  menuOpen = false;

  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }

  close() {
    this.menuOpen = false;
  }
}
