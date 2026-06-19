import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-pages-editor',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './pages-editor.html',
  styleUrl: './pages-editor.css'
})
export class PagesEditor implements OnInit {
  pages: any[] = [];
  loading = true;
  selectedPage: any = null;
  saving = false;
  saved = false;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getPages().subscribe({
      next: (d: any) => {
        this.pages = Array.isArray(d)
          ? d
          : Object.entries(d).map(([key, val]: any) => ({ key, ...val }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  selectPage(p: any) { this.selectedPage = { ...p }; this.saved = false; }

  pageFields(page: any): string[] {
    return Object.keys(page).filter(
      k => !['key', '_id', 'id', '__v'].includes(k) && typeof page[k] === 'string'
    );
  }

  save() {
    this.saving = true;
    const key = this.selectedPage.key || this.selectedPage._id || this.selectedPage.id;
    this.api.updatePage(key, this.selectedPage).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 2000);
      },
      error: () => { this.saving = false; }
    });
  }
}
