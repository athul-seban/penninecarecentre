import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth';
import { Sidebar } from '../../shared/sidebar/sidebar';

type Tab = 'users' | 'roles';

@Component({
  selector: 'app-users-manager',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './users-manager.html',
  styleUrl: './users-manager.css'
})
export class UsersManager implements OnInit {
  activeTab: Tab = 'users';
  currentUserId: string | null = null;

  // Users
  users: any[] = [];
  loadingUsers = true;
  showUserForm = false;
  editingUserId: string | null = null;
  savingUser = false;
  userForm: any = { name: '', email: '', password: '', role: '' };
  userError = '';

  // Roles
  roles: any[] = [];
  loadingRoles = true;
  showRoleForm = false;
  editingRoleId: string | null = null;
  savingRole = false;
  roleForm: any = { name: '', permissions: [] as string[] };
  roleError = '';

  permissionKeys: { key: string; label: string }[] = [];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    this.currentUserId = this.auth.getUser()?.id ?? null;
    this.loadPermissionKeys();
    this.loadRoles();
    this.loadUsers();
  }

  // ── Users ──

  loadUsers() {
    this.loadingUsers = true;
    this.api.getUsers().subscribe({
      next: (d: any) => { this.users = Array.isArray(d) ? d : []; this.loadingUsers = false; },
      error: () => { this.loadingUsers = false; }
    });
  }

  openAddUser() {
    this.userError = '';
    this.editingUserId = null;
    this.userForm = { name: '', email: '', password: '', role: this.roles[0]?.name || '' };
    this.showUserForm = true;
  }

  openEditUser(u: any) {
    this.userError = '';
    this.editingUserId = u.id;
    this.userForm = { name: u.name || '', email: u.email || '', password: '', role: u.role || '' };
    this.showUserForm = true;
  }

  cancelUser() {
    this.showUserForm = false;
  }

  saveUser() {
    this.userError = '';
    this.savingUser = true;
    const payload: any = { name: this.userForm.name, email: this.userForm.email, role: this.userForm.role };
    if (this.userForm.password) payload.password = this.userForm.password;
    if (!this.editingUserId) payload.password = this.userForm.password;

    const obs = this.editingUserId
      ? this.api.updateUser(this.editingUserId, payload)
      : this.api.createUser(payload);

    obs.subscribe({
      next: () => { this.savingUser = false; this.showUserForm = false; this.loadUsers(); },
      error: (err) => {
        this.savingUser = false;
        this.userError = err?.error?.message || 'Could not save user.';
      }
    });
  }

  deleteUser(u: any) {
    if (u.id === this.currentUserId) return;
    if (!confirm(`Delete user "${u.name || u.email}"?`)) return;
    this.api.deleteUser(u.id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert(err?.error?.message || 'Could not delete user.')
    });
  }

  // ── Roles ──

  loadRoles() {
    this.loadingRoles = true;
    this.api.getRoles().subscribe({
      next: (d: any) => { this.roles = Array.isArray(d) ? d : []; this.loadingRoles = false; },
      error: () => { this.loadingRoles = false; }
    });
  }

  loadPermissionKeys() {
    this.api.getPermissionKeys().subscribe({
      next: (d: any) => { this.permissionKeys = Array.isArray(d) ? d : []; },
      error: () => {}
    });
  }

  openAddRole() {
    this.roleError = '';
    this.editingRoleId = null;
    this.roleForm = { name: '', permissions: [] };
    this.showRoleForm = true;
  }

  openEditRole(r: any) {
    this.roleError = '';
    this.editingRoleId = r.id;
    this.roleForm = { name: r.name, permissions: [...(r.permissions || [])] };
    this.showRoleForm = true;
  }

  cancelRole() {
    this.showRoleForm = false;
  }

  togglePermission(key: string) {
    const idx = this.roleForm.permissions.indexOf(key);
    if (idx >= 0) this.roleForm.permissions.splice(idx, 1);
    else this.roleForm.permissions.push(key);
  }

  saveRole() {
    this.roleError = '';
    this.savingRole = true;
    const payload = { name: this.roleForm.name, permissions: this.roleForm.permissions };
    const obs = this.editingRoleId
      ? this.api.updateRole(this.editingRoleId, payload)
      : this.api.createRole(payload);

    obs.subscribe({
      next: () => { this.savingRole = false; this.showRoleForm = false; this.loadRoles(); },
      error: (err) => {
        this.savingRole = false;
        this.roleError = err?.error?.message || 'Could not save role.';
      }
    });
  }

  deleteRole(r: any) {
    if (!confirm(`Delete role "${r.name}"?`)) return;
    this.api.deleteRole(r.id).subscribe({
      next: () => this.loadRoles(),
      error: (err) => alert(err?.error?.message || 'Could not delete role.')
    });
  }

  usersOnRole(roleName: string): number {
    return this.users.filter((u) => u.role === roleName).length;
  }
}
