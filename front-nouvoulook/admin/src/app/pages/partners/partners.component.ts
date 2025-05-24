import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { PermissionsService } from '../../services/permissions.service';
import { PictosService } from '../../services/pictos.service';
import { environment } from '../../../environments/environment';

export interface Partner {
  id?: number;
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="permissionsLoaded">
      <ng-container *ngIf="hasAccess; else forbidden">
        <div class="container-fluid">
          <h2>Gestion des Partenaires</h2>

          <button class="btn btn-success mb-3" (click)="openModal()">
            <span class="material-icons" style="font-size: 20px; vertical-align: middle; margin-right: 4px;">add_circle_outline</span>
            Ajouter un partenaire
          </button>

          <div *ngIf="loading" class="alert alert-info">Chargement des partenaires...</div>
          <div *ngIf="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
          <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

          <table class="table table-striped table-hover" *ngIf="!loading && partners.length > 0">
            <thead>
              <tr>
                <th scope="col" style="width: 80px;">Logo</th>
                <th scope="col">Nom</th>
                
                <th scope="col" style="width: 150px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let partner of partners">
                <td>
                  <img *ngIf="partner.imageUrl" [src]="getImageUrl(partner.imageUrl)" alt="Logo {{ partner.name }}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px;">
                </td>
                <td>{{ partner.name }}</td>
                
                <td>
                  <button class="btn btn-sm btn-primary me-2" (click)="openModal(partner)">
                    <span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">edit</span>
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deletePartner(partner)">
                    <span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="!loading && partners.length === 0" class="alert alert-secondary">
            Aucun partenaire trouvé.
          </div>
        </div>

        <!-- Modal Ajout/Modification Partenaire -->
        <div class="modal" tabindex="-1" [ngStyle]="{display: showPartnerModal ? 'block' : 'none'}">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ currentPartner.id ? 'Modifier le partenaire' : 'Ajouter un partenaire' }}</h5>
                <button type="button" class="btn-close" (click)="closeModal()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="savePartner()" #partnerForm="ngForm">
                  <div class="mb-3">
                    <label for="partnerName" class="form-label">Nom du partenaire <span class="text-danger">*</span></label>
                    <input type="text" id="partnerName" name="partnerName" class="form-control" [(ngModel)]="currentPartner.name" required>
                  </div>
                  <div class="mb-3">
                    <label for="partnerImageUrl" class="form-label">Logo (URL ou bibliothèque)</label>
                    <div class="input-group">
                      <input type="text" id="partnerImageUrl" name="partnerImageUrl" class="form-control" [(ngModel)]="currentPartner.imageUrl" (ngModelChange)="onImageFieldChange('imageUrl', $event)">
                      <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('imageUrl')">Bibliothèque</button>
                    </div>
                    <div *ngIf="currentPartner.imageUrl" class="mt-2">
                      <img [src]="getImageUrl(currentPartner.imageUrl)" alt="Aperçu Logo" style="max-width: 100px; max-height: 100px; object-fit: contain; border: 1px solid #ddd; padding: 5px; border-radius: 4px;">
                    </div>
                  </div>
                  
                  
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
                    <button type="submit" class="btn btn-primary" [disabled]="!partnerForm.form.valid || loading">
                      {{ loading ? 'Enregistrement...' : (currentPartner.id ? 'Enregistrer les modifications' : 'Ajouter le partenaire') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Modale Bibliothèque d'images (similaire à BoutiqueComponent) -->
        <div class="modal" tabindex="-1" [ngStyle]="{display: showImageLibrary ? 'block' : 'none'}">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Bibliothèque d'images</h5>
                <button type="button" class="btn-close" (click)="closeLibrary()"></button>
              </div>
              <div class="modal-body">
                 <div class="mb-2 text-muted" style="font-size: 0.95rem;">
                    Cliquez sur une image pour la sélectionner ou téléchargez une nouvelle image.
                  </div>
                  <div class="mb-3">
                    <a href="https://svgsilh.com/" target="_blank" class="btn btn-outline-primary btn-sm me-2">
                      <span class="material-icons" style="font-size: 16px; vertical-align: middle;">link</span>
                      Trouver des icônes (svgsilh.com)
                    </a>
                    <input type="file" (change)="uploadPicto($event)" class="form-control-file form-control-sm" style="display:inline-block; width: auto;">
                  </div>
                  <div class="pictos-gallery" style="max-height: 400px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 10px;">
                    <div *ngFor="let picto of pictosList" style="position:relative; padding: 5px; border:1px solid #ddd; border-radius: 4px; background: #f9f9f9; width: 90px; text-align: center;">
                      <img
                        [src]="apiUrl + picto.url"
                        (click)="selectPictoFromLibrary(picto)"
                        [class.selected]="getCurrentImageFieldValue() === picto.url"
                        [class.clickable]="true"
                        style="width:75px; height:75px; object-fit:contain; border:1px solid #eee; cursor:pointer; transition: box-shadow 0.2s, border 0.2s; border-radius: 3px;">
                      <span *ngIf="getCurrentImageFieldValue() === picto.url"
                            style="position:absolute;top:2px;right:2px;color:#28a745;font-size:18px; background: white; border-radius: 50%; padding: 0 2px;">✔</span>
                      <button (click)="removePicto(picto)" class="btn btn-danger btn-sm" style="position:absolute; top: -5px; right: -5px; padding: 0px 4px; font-size: 0.7rem; width: 20px; height: 20px; line-height: 0.7rem; border-radius: 50%;">&times;</button>
                      <div class="text-muted small" style="font-size: 0.7rem; text-align: center; max-width: 75px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px;">{{ picto.originalName || 'Image' }}</div>
                    </div>
                    <div *ngIf="pictosList.length === 0" class="text-muted p-3 w-100 text-center">Aucune image dans la bibliothèque.</div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
      <ng-template #forbidden>
        <div class="alert alert-danger mt-4">Accès refusé : vous n'avez pas la permission d'accéder à cette page.</div>
      </ng-template>
    </ng-container>
    <ng-container *ngIf="!permissionsLoaded">
      <div>Chargement des permissions...</div>
    </ng-container>
  `,
  styles: [
    `.modal { background: rgba(0,0,0,0.3); }`,
    `.pictos-gallery img.clickable:hover { border: 2px solid #007bff; box-shadow: 0 0 8px #007bff60; }`,
    `.pictos-gallery img.selected { border: 2px solid #28a745; box-shadow: 0 0 8px #28a74560; }`
  ]
})
export class PartnersComponent implements OnInit, OnDestroy {
  hasAccess = false;
  permissionsLoaded = false;
  private permissionSub: Subscription | undefined;
  
  partners: Partner[] = [];
  currentPartner: Partner = this.resetCurrentPartner();
  
  loading = false;
  errorMsg = '';
  successMsg = '';
  
  showPartnerModal = false;
  showImageLibrary = false;
  
  pictosList: any[] = [];
  apiUrl = environment.apiUrl;
  private currentImageTargetField: keyof Partner = 'imageUrl';


  constructor(
    private permissionsService: PermissionsService,
    private http: HttpClient,
    private pictosService: PictosService
  ) {}

  ngOnInit() {
    this.permissionSub = this.permissionsService.getPermissions().subscribe(perms => {
      this.hasAccess = perms.some(p => p.resource === 'partners');
      this.permissionsLoaded = true;
      if (this.hasAccess) {
        this.loadPartners();
      }
    });
  }

  ngOnDestroy() {
    if (this.permissionSub) {
      this.permissionSub.unsubscribe();
    }
  }

  resetCurrentPartner(): Partner {
    return { name: '', imageUrl: '' };
  }

  loadPartners() {
    this.loading = true;
    this.errorMsg = '';
    this.http.get<Partner[]>(`${this.apiUrl}/partners`).subscribe({
      next: (data) => {
        this.partners = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement partenaires:', err);
        this.errorMsg = 'Erreur lors du chargement des partenaires.';
        this.loading = false;
      }
    });
  }

  openModal(partner?: Partner) {
    this.errorMsg = '';
    this.successMsg = '';
    if (partner) {
      this.currentPartner = { ...partner };
    } else {
      this.currentPartner = this.resetCurrentPartner();
    }
    this.showPartnerModal = true;
  }

  closeModal() {
    this.showPartnerModal = false;
    this.currentPartner = this.resetCurrentPartner();
  }

  savePartner() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    let request;
    if (this.currentPartner.id) {
      request = this.http.patch<Partner>(`${this.apiUrl}/partners/${this.currentPartner.id}`, this.currentPartner);
    } else {
      request = this.http.post<Partner>(`${this.apiUrl}/partners`, this.currentPartner);
    }

    request.subscribe({
      next: () => {
        this.successMsg = `Partenaire ${this.currentPartner.id ? 'mis à jour' : 'ajouté'} avec succès.`;
        this.loading = false;
        this.loadPartners();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erreur sauvegarde partenaire:', err);
        this.errorMsg = 'Erreur lors de la sauvegarde du partenaire.';
        this.loading = false;
      }
    });
  }

  deletePartner(partner: Partner) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le partenaire "${partner.name}" ?`)) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';
      this.http.delete(`${this.apiUrl}/partners/${partner.id}`).subscribe({
        next: () => {
          this.successMsg = 'Partenaire supprimé avec succès.';
          this.loading = false;
          this.loadPartners();
        },
        error: (err) => {
          console.error('Erreur suppression partenaire:', err);
          this.errorMsg = 'Erreur lors de la suppression du partenaire.';
          this.loading = false;
        }
      });
    }
  }

  // --- Gestion Librairie d'images ---
  openLibrary(field: keyof Partner) {
    this.currentImageTargetField = field; // Pour savoir quel champ de currentPartner mettre à jour
    this.showImageLibrary = true;
    this.loadPictos();
  }

  closeLibrary() {
    this.showImageLibrary = false;
  }

  loadPictos() {
    this.pictosService.getPictos().subscribe(data => this.pictosList = data);
  }

  selectPictoFromLibrary(picto: any) {
    if (this.currentImageTargetField) {
       (this.currentPartner as any)[this.currentImageTargetField] = picto.url;
       this.onImageFieldChange(this.currentImageTargetField, picto.url);
    }
    this.closeLibrary();
  }
  
  uploadPicto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pictosService.uploadPicto(file).subscribe(() => {
        this.loadPictos(); // Recharger pour voir la nouvelle image
        this.successMsg = "Image téléversée avec succès dans la bibliothèque.";
      }, () => {
        this.errorMsg = "Erreur lors du téléversement de l'image.";
      });
    }
  }

  removePicto(picto: any) {
    if (confirm('Supprimer cette image de la bibliothèque ? (Cela ne la retire pas du champ partenaire actuel si déjà sélectionnée)')) {
      this.pictosService.deletePicto(picto.id).subscribe(() => {
         this.loadPictos();
         this.successMsg = "Image supprimée de la bibliothèque.";
      }, () => {
        this.errorMsg = "Erreur lors de la suppression de l'image de la bibliothèque.";
      });
    }
  }
  
  getImageUrl(url: string | undefined): string {
    if (!url) return ''; // Default placeholder or empty string
    if (url.startsWith('http')) return url;
    // Si l'URL commence par /assets ou juste par /, on la préfixe avec l'apiUrl.
    // C'est utile si les pictos sont stockés dans le dossier public de l'API.
    if (url.startsWith('/')) return this.apiUrl + url; 
    return this.apiUrl + '/' + url; // Cas par défaut, pour les URLs relatives comme "uploads/image.png"
  }
  
  getCurrentImageFieldValue(): string {
    return this.currentImageTargetField ? (this.currentPartner as any)[this.currentImageTargetField] || '' : '';
  }

  onImageFieldChange(field: keyof Partner, value: string) {
    (this.currentPartner as any)[field] = value;
  }
} 