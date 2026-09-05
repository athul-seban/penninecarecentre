import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFoundComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Page Not Found | Pennine Care Centre',
      description: 'The page you were looking for could not be found.',
      path: '/not-found',
      noindex: true,
    });
  }
}
