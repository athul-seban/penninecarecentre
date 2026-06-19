import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

export const THEMES = [
  { id: 'classic', label: 'Classic',       description: 'Navy & Gold — timeless and professional',    colors: ['#002b5b','#c5a059','#faf9f6'] },
  { id: 'modern',  label: 'Modern Dark',   description: 'Near-black with electric cyan accents',       colors: ['#0d0d1a','#00d4ff','#161628'] },
  { id: 'sage',    label: 'Warm Sage',     description: 'Forest green with warm copper tones',         colors: ['#2a4523','#b8925a','#f4f0e6'] },
  { id: 'rose',    label: 'Rose & Slate',  description: 'Slate blue with dusty rose highlights',       colors: ['#2c3e50','#c27b6e','#fdf6f4'] },
  { id: 'royal',   label: 'Royal Purple',  description: 'Deep violet with soft lavender accents',      colors: ['#2d1b69','#9b7ed4','#f7f4ff'] },
];

@Component({
  selector: 'app-settings-editor',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './settings-editor.html',
  styleUrl: './settings-editor.css'
})
export class SettingsEditor implements OnInit {
  themes = THEMES;
  activeTheme = 'classic';
  rawSettings: any = {};
  loading = true;
  saving = false;
  saved = false;
  errorMsg = '';

  fields = [
    { key: 'site.phone',          label: 'Phone Number',       type: 'text',     group: 'contact' },
    { key: 'site.email',          label: 'Contact Email',      type: 'email',    group: 'contact' },
    { key: 'site.address',        label: 'Address',            type: 'text',     group: 'contact' },
    { key: 'site.whatsapp',       label: 'WhatsApp Number',    type: 'text',     group: 'contact' },
    { key: 'hero.headline',       label: 'Hero Headline',      type: 'text',     group: 'hero' },
    { key: 'hero.subtext',        label: 'Hero Sub Text',      type: 'text',     group: 'hero' },
    { key: 'announcement.text',   label: 'Announcement Text',  type: 'text',     group: 'announcement' },
    { key: 'announcement.active', label: 'Show Announcement',  type: 'toggle',   group: 'announcement' },
    { key: 'site.cqcRating',      label: 'CQC Rating',         type: 'text',     group: 'seo' },
    { key: 'site.googleMapsUrl',  label: 'Google Maps Embed URL', type: 'text',  group: 'contact' },
  ];

  values: Record<string, string> = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (groups: any) => {
        this.rawSettings = groups;
        // Flatten all groups into values map
        Object.values(groups).forEach((arr: any) => {
          arr.forEach((s: any) => { this.values[s.key] = s.value; });
        });
        this.activeTheme = this.values['site.theme'] ?? 'classic';
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setTheme(id: string) {
    this.activeTheme = id;
    this.values['site.theme'] = id;
  }

  save() {
    this.saving = true;
    this.errorMsg = '';
    const updates = Object.entries(this.values).map(([key, value]) => ({ key, value }));
    this.api.updateSettings({ updates }).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 2500);
      },
      error: (e: any) => {
        this.saving = false;
        this.errorMsg = 'Failed to save settings. Check backend connection.';
      }
    });
  }
}
