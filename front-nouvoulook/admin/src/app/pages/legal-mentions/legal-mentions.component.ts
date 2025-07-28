import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermissionsService } from '../../services/permissions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal-mentions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="!hasLegalMentionsAccess" class="alert alert-danger mt-4">Accès interdit : vous n'avez pas la permission d'accéder à cette page.</div>
    <div *ngIf="hasLegalMentionsAccess" class="container-fluid">
      <h2>Mentions Légales</h2>
      <div class="card mt-4">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #legalMentionsForm="ngForm" autocomplete="off">
            <div class="mb-3">
              <label for="raisonSociale" class="form-label">Raison Sociale</label>
              <input type="text" id="raisonSociale" name="raisonSociale" class="form-control" [(ngModel)]="legalMentions.raisonSociale" required />
            </div>
            <div class="mb-3">
              <label for="formeJuridique" class="form-label">Forme Juridique</label>
              <input type="text" id="formeJuridique" name="formeJuridique" class="form-control" [(ngModel)]="legalMentions.formeJuridique" required />
            </div>
            <div class="mb-3">
              <label for="siegeSocial" class="form-label">Siège Social</label>
              <input type="text" id="siegeSocial" name="siegeSocial" class="form-control" [(ngModel)]="legalMentions.siegeSocial" required />
            </div>
            <div class="mb-3">
              <label for="siren" class="form-label">SIREN</label>
              <input type="text" id="siren" name="siren" class="form-control" [(ngModel)]="legalMentions.siren" required />
            </div>
            <div class="mb-3">
              <label for="siret" class="form-label">SIRET</label>
              <input type="text" id="siret" name="siret" class="form-control" [(ngModel)]="legalMentions.siret" required />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" name="email" class="form-control" [(ngModel)]="legalMentions.email" required />
            </div>
            <div class="mb-3">
              <label for="telephone" class="form-label">Téléphone</label>
              <input type="text" id="telephone" name="telephone" class="form-control" [(ngModel)]="legalMentions.telephone" required />
            </div>
            <div class="mb-3">
              <label for="directeurPublication" class="form-label">Directeur de Publication</label>
              <input type="text" id="directeurPublication" name="directeurPublication" class="form-control" [(ngModel)]="legalMentions.directeurPublication" required />
            </div>
            <div class="mb-3">
              <label for="hebergeur" class="form-label">Hébergeur</label>
              <input type="text" id="hebergeur" name="hebergeur" class="form-control" [(ngModel)]="legalMentions.hebergeur" required />
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
export class LegalMentionsComponent implements OnInit {
  legalMentions: any = {
    raisonSociale: '',
    formeJuridique: '',
    siegeSocial: '',
    siren: '',
    siret: '',
    email: '',
    telephone: '',
    directeurPublication: '',
    hebergeur: ''
  };
  loading = false;
  successMsg = '';
  errorMsg = '';
  hasLegalMentionsAccess = false;

  constructor(private http: HttpClient, private permissions: PermissionsService, private router: Router) {}

  ngOnInit() {
    this.hasLegalMentionsAccess = this.permissions.hasAccess('legal-mentions');
    if (!this.hasLegalMentionsAccess) return;
    this.loadLegalMentions();
  }

  loadLegalMentions() {
    this.http.get(`${environment.apiUrl}/legal-mentions`).subscribe({
      next: (data: any) => {
        if (data) this.legalMentions = data;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.http.patch(`${environment.apiUrl}/legal-mentions`, this.legalMentions).subscribe({
      next: () => {
        this.successMsg = 'Mentions légales enregistrées !';
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors de l\'enregistrement.';
        this.loading = false;
      }
    });
  }
} 