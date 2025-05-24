import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermissionsService } from '../../services/permissions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="!hasContactAccess" class="alert alert-danger mt-4">Accès interdit : vous n'avez pas la permission d'accéder à cette page.</div>
    <div *ngIf="hasContactAccess" class="container-fluid">
      <h2>Informations de contact & configuration SMTP</h2>
      <div class="card mt-4">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #contactForm="ngForm" autocomplete="off">
            <div class="mb-3">
              <label for="smtpUser" class="form-label">Mail (identifiant gmail)</label>
              <input type="text" id="smtpUser" name="smtp_login" class="form-control" [(ngModel)]="contactInfo.smtpUser" required autocomplete="off" readonly (focus)="removeReadonly($event)" />
            </div>
            <div class="mb-3">
              <label for="smtpPass" class="form-label">
                <a href="https://support.microsoft.com/fr-fr/account-billing/comment-obtenir-et-utiliser-des-mots-de-passe-d-application-5896ed9b-4263-e681-128a-a6f2979a7944" target="_blank" class="text-primary text-decoration-underline" style="cursor:pointer;">
                  Mot de passe d'application
                </a> gmail
              </label>
              <input type="password" id="smtpPass" name="smtpPass" class="form-control" [(ngModel)]="contactInfo.smtpPass" required autocomplete="new-password" />
            </div>
            <div class="mb-3">
              <label for="publicEmail" class="form-label">Email affiché sur le site</label>
              <input type="email" id="publicEmail" name="publicEmail" class="form-control" [(ngModel)]="contactInfo.publicEmail" required />
            </div>
            <div class="mb-3">
              <label for="phone" class="form-label">Téléphone</label>
              <input type="text" id="phone" name="phone" class="form-control" [(ngModel)]="contactInfo.phone" required />
            </div>
            <div class="mb-3">
              <label for="address" class="form-label">Adresse</label>
              <input type="text" id="address" name="address" class="form-control" [(ngModel)]="contactInfo.address" required />
            </div>
            <div class="mb-3">
              <label for="openingHours" class="form-label">Horaires d'ouverture</label>
              <textarea id="openingHours" name="openingHours" class="form-control" rows="2" [(ngModel)]="contactInfo.openingHours"></textarea>
              <div class="form-text">Exemple : Mardi au samedi : 14h - 18h\nFermé dimanche et lundi</div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="loading">{{ loading ? 'Enregistrement...' : 'Enregistrer' }}</button>
          </form>
          <div *ngIf="successMsg" class="alert alert-success mt-3">{{ successMsg }}</div>
          <div *ngIf="errorMsg" class="alert alert-danger mt-3">{{ errorMsg }}</div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
  contactInfo: any = {
    smtpUser: '',
    smtpPass: '',
    publicEmail: '',
    phone: '',
    address: '',
    openingHours: ''
  };
  loading = false;
  successMsg = '';
  errorMsg = '';
  hasContactAccess = false;

  constructor(private http: HttpClient, private permissions: PermissionsService, private router: Router) {}

  ngOnInit() {
    this.hasContactAccess = this.permissions.hasAccess('contact');
    if (!this.hasContactAccess) return;
    this.loadContactInfo();
  }

  loadContactInfo() {
    this.http.get(`${environment.apiUrl}/contact-info`).subscribe({
      next: (data: any) => {
        if (data) this.contactInfo = data;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.http.patch(`${environment.apiUrl}/contact-info`, this.contactInfo).subscribe({
      next: () => {
        this.successMsg = 'Informations enregistrées !';
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors de l\'enregistrement.';
        this.loading = false;
      }
    });
  }

  removeReadonly(event: any) {
    event.target.removeAttribute('readonly');
  }
} 