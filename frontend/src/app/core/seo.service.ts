import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

const SITE_URL = 'https://penninecarecentre.com';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/pennine-suite-hero.png`;
const DEFAULT_TITLE = 'Pennine Care Centre | Caring is What We Do Best';
const DEFAULT_DESCRIPTION = 'Pennine Care Centre — premium residential care in Glossop, Derbyshire. Dementia care, a male-only unit, and specialist support.';

export interface SeoOptions {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  /** Applies page title, meta description, Open Graph/Twitter tags, canonical link, and robots directive. */
  update(options: SeoOptions): void {
    const title = options.title?.trim() || DEFAULT_TITLE;
    const description = options.description?.trim() || DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${options.path}`;
    const image = options.image || DEFAULT_IMAGE;

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: options.noindex ? 'noindex, nofollow' : 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
