import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
    this.error = '';
    this.loading = true;
    this.api.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.auth.setSession(res.access_token || res.token, res.user);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Invalid credentials. Please try again.';
        this.loading = false;
      }
    });
  }
}
