import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-account',
  imports: [FormsModule, Sidebar],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  profileForm: any = { name: '', email: '' };
  savingProfile = false;
  profileSaved = false;
  profileError = '';

  passwordForm: any = { currentPassword: '', newPassword: '', confirmPassword: '' };
  savingPassword = false;
  passwordSaved = false;
  passwordError = '';

  role = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.getUser();
    this.profileForm = { name: user?.name || '', email: user?.email || '' };
    this.role = user?.role || '';
  }

  saveProfile() {
    this.profileError = '';
    this.profileSaved = false;
    this.savingProfile = true;
    this.api.updateProfile(this.profileForm).subscribe({
      next: (user: any) => {
        this.auth.updateUser(user);
        this.savingProfile = false;
        this.profileSaved = true;
        setTimeout(() => (this.profileSaved = false), 2500);
      },
      error: (err) => {
        this.savingProfile = false;
        this.profileError = err?.error?.message || 'Could not save your profile.';
      }
    });
  }

  savePassword() {
    this.passwordError = '';
    this.passwordSaved = false;
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'New password and confirmation do not match.';
      return;
    }
    this.savingPassword = true;
    this.api.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordSaved = true;
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => (this.passwordSaved = false), 2500);
      },
      error: (err) => {
        this.savingPassword = false;
        this.passwordError = err?.error?.message || 'Could not change your password.';
      }
    });
  }
}
