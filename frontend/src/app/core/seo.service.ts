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
  /** Open Graph type — 'article' for blog posts, adds article:published_time/modified_time. */
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
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
    const image = this.absoluteUrl(options.image) || DEFAULT_IMAGE;
    const type = options.type || 'website';

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: options.noindex ? 'noindex, nofollow' : 'index, follow' });

    this.meta.updateTag({ property: 'og:site_name', content: 'Pennine Care Centre' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    if (type === 'article' && options.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: options.publishedTime });
    } else {
      this.meta.removeTag('property="article:published_time"');
    }
    if (type === 'article' && options.modifiedTime) {
      this.meta.updateTag({ property: 'article:modified_time', content: options.modifiedTime });
    } else {
      this.meta.removeTag('property="article:modified_time"');
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
  }

  /** Injects/replaces a JSON-LD structured-data block. Pass null to remove it. */
  updateJsonLd(data: object | null): void {
    let script = this.doc.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]#seo-jsonld');
    if (!data) {
      script?.remove();
      return;
    }
    if (!script) {
      script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-jsonld';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  private absoluteUrl(path?: string): string | undefined {
    if (!path) return undefined;
    return path.startsWith('http') ? path : `${SITE_URL}${path}`;
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
