import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService, toTelHref } from '../../core/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent implements OnInit {
  phone = '01457 862466';
  email = 'Admin@nyms-services.com';
  address = 'Turnlee Road, Glossop, Derbyshire, SK13 6JW';

  constructor(private settings: SettingsService) {}

  get telHref(): string {
    return toTelHref(this.phone);
  }

  ngOnInit(): void {
    this.settings.getContactInfo().subscribe({
      next: (info) => {
        if (info.phone) this.phone = info.phone;
        if (info.email) this.email = info.email;
        if (info.address) this.address = info.address;
      },
      error: () => { /* keep defaults */ }
    });
  }
}
