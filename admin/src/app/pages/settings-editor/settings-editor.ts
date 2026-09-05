import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-settings-editor',
  imports: [FormsModule, Sidebar],
  templateUrl: './settings-editor.html',
  styleUrl: './settings-editor.css'
})
export class SettingsEditor implements OnInit {
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
    { key: 'email.smtp.host',     label: 'SMTP Host',          type: 'text',     group: 'email' },
    { key: 'email.smtp.port',     label: 'SMTP Port',          type: 'text',     group: 'email' },
    { key: 'email.smtp.secure',   label: 'Use SSL',            type: 'toggle',   group: 'email' },
    { key: 'email.smtp.user',     label: 'SMTP Username',      type: 'email',    group: 'email' },
    { key: 'email.smtp.pass',     label: 'SMTP Password',      type: 'password', group: 'email' },
    { key: 'email.contact.to',    label: 'Forward Enquiries To', type: 'email',  group: 'email' },
    { key: 'email.careers.to',    label: 'Forward Job Applications To (defaults to Forward Enquiries To if blank)', type: 'email', group: 'email' },
    { key: 'email.contact.from',  label: 'Send From Address',  type: 'email',    group: 'email' },
  ];

  showPass = false;

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
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
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
