import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

const LABEL_MAP: Record<string, string> = {
  heroEyebrow: 'Hero Eyebrow Text', heroHeadline: 'Hero Headline', heroCta: 'Hero Button Text',
  heroTitle: 'Hero Title', heroSubtitle: 'Hero Subtitle', heroSubText: 'Hero Sub Text',
  heroPretext: 'Hero Pre-text',
  introTitle: 'Intro Section Title', introText: 'Intro Text', introDetailText: 'Intro Detail Text',
  pennineTitle: 'Pennine Suite Title', pennineDescription: 'Pennine Suite Description',
  moorlandTitle: 'Moorland Suite Title', moorlandDescription: 'Moorland Suite Description',
  testimonialsSubtitle: 'Testimonials Sub-heading', testimonialsTitle: 'Testimonials Title',
  reviewRating: 'Review Rating Label', reviewCount: 'Review Count Label',
  peaceTitle: 'Peace of Mind Title', peaceText: 'Peace of Mind Text', peaceQuote: 'Peace of Mind Quote',
  communityTitle: 'Community Section Title', communityText: 'Community Text', communityQuote: 'Community Quote',
  communityDetailText: 'Community Detail Text',
  bedroomsTitle: 'Bedrooms Section Title', bedroomsText: 'Bedrooms Text', bedroomsAmenitiesText: 'Bedroom Amenities',
  gardensTitle: 'Gardens Section Title', gardensText: 'Gardens Text',
  wellnessTitle: 'Wellbeing Space Title', wellnessText: 'Wellbeing Space Text',
  havenTitle: 'Haven Title', havenText: 'Haven Text', havenDetailText: 'Haven Detail Text',
  spacesTitle: 'Community Spaces Title', spacesText: 'Community Spaces Text',
  modernisationTitle: 'Modernisation Title', modernisationText: 'Modernisation Text',
  featureCost: 'Feature: No Hidden Costs (title)', featureCostText: 'Feature: No Hidden Costs (text)',
  featureTeam: 'Feature: Dedicated Team (title)', featureTeamText: 'Feature: Dedicated Team (text)',
  featureEnvironment: 'Feature: Fresh Environment (title)', featureEnvironmentText: 'Feature: Fresh Environment (text)',
  olderPeopleTitle: 'Older People Care Title', olderPeopleText: 'Older People Care Text', olderPeopleDetailText: 'Older People Detail',
  dementiaTitle: 'Dementia Care Title', dementiaText: 'Dementia Care Text', dementiaDetailText: 'Dementia Care Detail',
  maleUnitTitle: 'Male Only Unit Title', maleUnitText: 'Male Only Unit Text',
  rehabilitationTitle: 'Rehabilitation Title', rehabilitationText: 'Rehabilitation Text',
  endOfLifeTitle: 'End of Life Care Title', endOfLifeText: 'End of Life Care Text',
  activitiesTitle: 'Activities Title', activitiesText: 'Activities Text',
  nutritionTitle: 'Nutrition & Hydration Title', nutritionText: 'Nutrition & Hydration Text',
  careTitle: 'Person Centred Care Title', careText: 'Person Centred Care Text',
  familyTitle: 'Family Partnerships Title', familyText: 'Family Partnerships Text',
  innovativeTitle: 'Innovative Care Title', innovativeText: 'Innovative Care Text',
  visionTitle: 'Our Vision Title', visionText: 'Our Vision Text',
  missionTitle: 'Our Mission Title', missionText: 'Our Mission Text',
  valuesTitle: 'Core Values Title', valuesCaring: 'Core Value: Caring',
  valuesContinuity: 'Core Value: Continuity', valuesCollaboration: 'Core Value: Collaboration', valuesCommitment: 'Core Value: Commitment',
  contactInfoTitle: 'Contact Info Title', address: 'Address', phone: 'Phone Number', email: 'Email Address',
  formTitle: 'Contact Form Title', successHeading: 'Success Heading', successMessage: 'Success Message',
  benefitTitle: 'Benefits Section Title', benefitIntro: 'Benefits Intro',
  benefitGrowth: 'Benefit: Career Growth (title)', benefitGrowthText: 'Benefit: Career Growth (text)',
  benefitWellbeing: 'Benefit: Staff Wellbeing (title)', benefitWellbeingText: 'Benefit: Staff Wellbeing (text)',
  benefitPay: 'Benefit: Pay (title)', benefitPayText: 'Benefit: Pay (text)',
  jobsTitle: 'Jobs Section Title', jobsIntro: 'Jobs Section Intro',
  applyTitle: 'Apply Section Title', applyIntro: 'Apply Section Intro',
  introTitle2: 'Intro Section Title 2',
  pennineImages: 'Pennine Suite Preview Images',
  moorlandImages: 'Moorland Suite Preview Images',
  introImages: 'Intro Section Images',
  communityImages: 'Community Section Images',
  bedroomImages: 'Bedroom Section Images',
  gardenImages: 'Garden & Outdoor Images',
  galleryImages: 'Photo Gallery Images',
  havenImages: 'Haven Section Images',
  spacesImages: 'Community Spaces Images',
  peaceImage: 'Peace Section Image (URL)',
  olderPeopleImage: 'Older People Care Image (URL)',
  dementiaImage: 'Dementia Care Image (URL)',
  maleUnitImage: 'Male Only Unit Image (URL)',
  rehabilitationImage: 'Rehabilitation Image (URL)',
  endOfLifeImage: 'End of Life Care Image (URL)',
  activitiesImage: 'Activities Image (URL)',
  communityImage: 'Community Engagement Image (URL)',
  nutritionImage: 'Nutrition & Hydration Image (URL)',
  careImage: 'Person Centred Care Image (URL)',
  familyImage: 'Family Partnerships Image (URL)',
  innovativeImage: 'Innovative Care Image (URL)',
};

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
  editableMeta: any = {};
  editableSections: { key: string; label: string; value: string; isArray: boolean; images: string[]; pendingUrl: string }[] = [];
  saving = false;
  saved = false;

  uploadingKey = '';
  uploadError = '';
  fullscreenImage = '';

  private readonly FRONTEND_BASE = 'http://localhost:4200';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getPages().subscribe({
      next: (d: any) => {
        this.pages = Array.isArray(d) ? d : Object.entries(d).map(([key, val]: any) => ({ key, ...val }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  selectPage(p: any) {
    this.selectedPage = p;
    this.saved = false;
    this.uploadError = '';
    this.editableMeta = { title: p.title || '', metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '' };
    const sections = p.sections || {};
    this.editableSections = Object.entries(sections).map(([key, value]) => ({
      key,
      label: LABEL_MAP[key] || this.titleCase(key),
      isArray: Array.isArray(value),
      images: Array.isArray(value) ? [...(value as string[])] : [],
      value: Array.isArray(value) ? '' : String(value || ''),
      pendingUrl: '',
    }));
  }

  save() {
    if (!this.selectedPage) return;
    this.saving = true;
    const sections: Record<string, any> = {};
    this.editableSections.forEach(s => { sections[s.key] = s.isArray ? s.images : s.value; });
    const payload = { ...this.editableMeta, sections };
    const key = this.selectedPage.pageKey || this.selectedPage.key || this.selectedPage.id;
    this.api.updatePage(key, payload).subscribe({
      next: () => {
        this.saving = false; this.saved = true;
        setTimeout(() => this.saved = false, 2500);
        const idx = this.pages.findIndex(p => (p.pageKey || p.key) === key);
        if (idx > -1) this.pages[idx] = { ...this.pages[idx], ...payload };
      },
      error: () => { this.saving = false; }
    });
  }

  addImage(s: { images: string[]; pendingUrl: string }) {
    const url = s.pendingUrl.trim();
    if (url) { s.images.push(url); s.pendingUrl = ''; }
  }

  removeImage(s: { images: string[] }, idx: number) { s.images.splice(idx, 1); }

  moveImageUp(s: { images: string[] }, idx: number) {
    if (idx > 0) { [s.images[idx - 1], s.images[idx]] = [s.images[idx], s.images[idx - 1]]; }
  }

  moveImageDown(s: { images: string[] }, idx: number) {
    if (idx < s.images.length - 1) { [s.images[idx + 1], s.images[idx]] = [s.images[idx], s.images[idx + 1]]; }
  }

  onFileSelected(event: Event, section: any, mode: 'single' | 'array-add' | 'array-replace', index = -1) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const key = section.key + (mode === 'array-replace' ? '_replace_' + index : mode === 'array-add' ? '_add' : '');
    this.uploadingKey = key;
    this.uploadError = '';
    const fd = new FormData();
    fd.append('file', file);
    this.api.uploadMedia(fd).subscribe({
      next: (res: any) => {
        const url = res.url || res.secure_url;
        if (mode === 'single') section.value = url;
        else if (mode === 'array-replace') section.images[index] = url;
        else section.images.push(url);
        this.uploadingKey = '';
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.uploadingKey = '';
        this.uploadError = 'Upload failed. Please try again.';
      }
    });
  }

  titleCase(s: string): string {
    return s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
  }

  isImageField(key: string): boolean {
    return (key.endsWith('Image') || key.endsWith('Url') || key.endsWith('Src')) && !key.endsWith('Images');
  }

  pageDisplayName(p: any): string {
    return p.title || p.pageKey || p.key || '(unnamed)';
  }

  isPageActive(p: any): boolean {
    return (this.selectedPage?.pageKey || this.selectedPage?.key) === (p.pageKey || p.key);
  }

  previewUrl(imgPath: string): string {
    if (!imgPath) return '';
    if (imgPath.startsWith('/assets/')) return this.FRONTEND_BASE + imgPath;
    return imgPath;
  }

  assetFilename(assetPath: string): string {
    return assetPath.split('/').pop() || assetPath;
  }

  openFullscreen(path: string) { this.fullscreenImage = path; }
  closeFullscreen() { this.fullscreenImage = ''; }
}
