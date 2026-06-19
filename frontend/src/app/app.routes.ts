import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { PennineSuiteComponent } from './pages/pennine-suite/pennine-suite';
import { MoorlandSuiteComponent } from './pages/moorland-suite/moorland-suite';
import { ServicesComponent } from './pages/services/services';
import { LifeAtPennineComponent } from './pages/life-at-pennine/life-at-pennine';
import { TeamComponent } from './pages/team/team';
import { ContactComponent } from './pages/contact/contact';
import { CareersComponent } from './pages/careers/careers';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pennine-suite', component: PennineSuiteComponent },
  { path: 'moorland-suite', component: MoorlandSuiteComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'life-at-pennine', component: LifeAtPennineComponent },
  { path: 'team', component: TeamComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'careers', component: CareersComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: '**', redirectTo: '' }
];
