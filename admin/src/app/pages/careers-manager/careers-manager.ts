import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-careers-manager',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './careers-manager.html',
  styleUrl: './careers-manager.css'
})
export class CareersManager implements OnInit {
  careers: any[] = [];
  loading = true;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: any = { title: '', department: '', location: '', type: '', description: '', requirements: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getCareers().subscribe({
      next: (d: any) => { this.careers = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAdd() { this.form = { title: '', department: '', location: '', type: '', description: '', requirements: '' }; this.editingId = null; this.showForm = true; }
  openEdit(c: any) { this.form = { ...c }; this.editingId = c._id || c.id; this.showForm = true; }
  cancel() { this.showForm = false; }

  save() {
    this.saving = true;
    const obs = this.editingId
      ? this.api.updateCareer(this.editingId, this.form)
      : this.api.createCareer(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.saving = false; this.load(); },
      error: () => { this.saving = false; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this job listing?')) return;
    this.api.deleteCareer(id).subscribe(() => this.load());
  }
}
