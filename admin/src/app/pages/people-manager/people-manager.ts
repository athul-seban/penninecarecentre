import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ImageUpload } from '../../shared/image-upload/image-upload';

type ActiveType = 'team' | 'career' | 'review' | null;

@Component({
  selector: 'app-people-manager',
  imports: [CommonModule, FormsModule, Sidebar, ImageUpload],
  templateUrl: './people-manager.html',
  styleUrl: './people-manager.css'
})
export class PeopleManager implements OnInit {
  activeType: ActiveType = null;

  // Team
  teamMembers: any[] = [];
  loadingTeam = true;
  selectedTeam: any = null;
  isNewTeam = false;
  savingTeam = false;
  savedTeam = false;
  teamForm: any = {};

  // Careers
  jobs: any[] = [];
  loadingJobs = true;
  selectedJob: any = null;
  isNewJob = false;
  savingJob = false;
  savedJob = false;
  jobForm: any = {};

  // Reviews
  reviews: any[] = [];
  loadingReviews = true;
  selectedReview: any = null;
  isNewReview = false;
  savingReview = false;
  savedReview = false;
  reviewForm: any = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTeam();
    this.loadJobs();
    this.loadReviews();
  }

  // ── Team ──

  loadTeam() {
    this.loadingTeam = true;
    this.api.getTeam().subscribe({
      next: (d: any) => { this.teamMembers = Array.isArray(d) ? d : []; this.loadingTeam = false; },
      error: () => { this.loadingTeam = false; }
    });
  }

  addTeamMember() {
    this.activeType = 'team';
    this.isNewTeam = true;
    this.selectedTeam = null;
    this.teamForm = { name: '', role: '', bio: '', photoUrl: '', isActive: true };
  }

  selectTeam(m: any) {
    this.activeType = 'team';
    this.isNewTeam = false;
    this.selectedTeam = m;
    this.savedTeam = false;
    this.teamForm = { name: m.name || '', role: m.role || '', bio: m.bio || '', photoUrl: m.photoUrl || '', isActive: m.isActive !== false };
  }

  saveTeam() {
    this.savingTeam = true;
    const id = this.selectedTeam?._id || this.selectedTeam?.id;
    const obs = this.isNewTeam ? this.api.createTeamMember(this.teamForm) : this.api.updateTeamMember(id, this.teamForm);
    obs.subscribe({
      next: () => {
        this.savingTeam = false; this.savedTeam = true;
        setTimeout(() => this.savedTeam = false, 2500);
        this.isNewTeam = false;
        this.loadTeam();
      },
      error: () => { this.savingTeam = false; }
    });
  }

  deleteTeam(id: any) {
    if (!confirm('Delete this team member?')) return;
    this.api.deleteTeamMember(id).subscribe(() => {
      this.activeType = null; this.selectedTeam = null;
      this.loadTeam();
    });
  }

  isTeamActive(m: any): boolean {
    if (this.activeType !== 'team' || this.isNewTeam) return false;
    return (this.selectedTeam?._id || this.selectedTeam?.id) === (m._id || m.id);
  }

  // ── Careers ──

  loadJobs() {
    this.loadingJobs = true;
    this.api.getCareers().subscribe({
      next: (d: any) => { this.jobs = Array.isArray(d) ? d : []; this.loadingJobs = false; },
      error: () => { this.loadingJobs = false; }
    });
  }

  addJob() {
    this.activeType = 'career';
    this.isNewJob = true;
    this.selectedJob = null;
    this.jobForm = { title: '', department: '', location: 'Glossop, Derbyshire', type: 'Full-time', description: '', requirements: '', isOpen: true };
  }

  selectJob(j: any) {
    this.activeType = 'career';
    this.isNewJob = false;
    this.selectedJob = j;
    this.savedJob = false;
    this.jobForm = { title: j.title || '', department: j.department || '', location: j.location || '', type: j.type || 'Full-time', description: j.description || '', requirements: j.requirements || '', isOpen: j.isOpen !== false };
  }

  saveJob() {
    this.savingJob = true;
    const id = this.selectedJob?._id || this.selectedJob?.id;
    const obs = this.isNewJob ? this.api.createCareer(this.jobForm) : this.api.updateCareer(id, this.jobForm);
    obs.subscribe({
      next: () => {
        this.savingJob = false; this.savedJob = true;
        setTimeout(() => this.savedJob = false, 2500);
        this.isNewJob = false;
        this.loadJobs();
      },
      error: () => { this.savingJob = false; }
    });
  }

  deleteJob(id: any) {
    if (!confirm('Delete this job listing?')) return;
    this.api.deleteCareer(id).subscribe(() => {
      this.activeType = null; this.selectedJob = null;
      this.loadJobs();
    });
  }

  isJobActive(j: any): boolean {
    if (this.activeType !== 'career' || this.isNewJob) return false;
    return (this.selectedJob?._id || this.selectedJob?.id) === (j._id || j.id);
  }

  // ── Reviews ──

  loadReviews() {
    this.loadingReviews = true;
    this.api.getReviews().subscribe({
      next: (d: any) => { this.reviews = Array.isArray(d) ? d : []; this.loadingReviews = false; },
      error: () => { this.loadingReviews = false; }
    });
  }

  addReview() {
    this.activeType = 'review';
    this.isNewReview = true;
    this.selectedReview = null;
    this.reviewForm = { authorName: '', source: 'Google', rating: 5, text: '', isVisible: true };
  }

  selectReview(r: any) {
    this.activeType = 'review';
    this.isNewReview = false;
    this.selectedReview = r;
    this.savedReview = false;
    this.reviewForm = { authorName: r.authorName || '', source: r.source || 'Google', rating: r.rating || 5, text: r.text || '', isVisible: r.isVisible !== false };
  }

  saveReview() {
    this.savingReview = true;
    const id = this.selectedReview?._id || this.selectedReview?.id;
    const obs = this.isNewReview ? this.api.createReview(this.reviewForm) : this.api.updateReview(id, this.reviewForm);
    obs.subscribe({
      next: () => {
        this.savingReview = false; this.savedReview = true;
        setTimeout(() => this.savedReview = false, 2500);
        this.isNewReview = false;
        this.loadReviews();
      },
      error: () => { this.savingReview = false; }
    });
  }

  deleteReview(id: any) {
    if (!confirm('Delete this review?')) return;
    this.api.deleteReview(id).subscribe(() => {
      this.activeType = null; this.selectedReview = null;
      this.loadReviews();
    });
  }

  isReviewActive(r: any): boolean {
    if (this.activeType !== 'review' || this.isNewReview) return false;
    return (this.selectedReview?._id || this.selectedReview?.id) === (r._id || r.id);
  }

  stars(rating: number): string {
    return '★'.repeat(Math.round(rating || 0)) + '☆'.repeat(5 - Math.round(rating || 0));
  }
}
