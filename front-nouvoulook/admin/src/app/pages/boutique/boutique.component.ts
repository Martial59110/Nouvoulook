import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermissionsService } from '../../services/permissions.service';
import { PictosService } from '../../services/pictos.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="permissionsLoaded">
      <ng-container *ngIf="hasAccess; else forbidden">
        <div class="container-fluid">
          <h2>Gestion de la boutique</h2>
          
          <div class="card mt-4">
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #boutiqueForm="ngForm" autocomplete="off">
                <!-- Image URL (Hero) -->
                <div class="mb-3">
                  <label for="imageUrl" class="form-label">Image principale (bandeau)</label>
                  <div class="input-group">
                    <input type="text" id="imageUrl" name="imageUrl" class="form-control" [(ngModel)]="boutique.imageUrl" (ngModelChange)="onImageFieldChange('imageUrl', $event)" placeholder="/assets/boutique-hero.jpg" />
                    <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('imageUrl')">Bibliothèque</button>
                  </div>
                  <div *ngIf="boutique.imageUrl" class="mt-2">
                    <img [src]="getImageUrl(boutique.imageUrl)" alt="Aperçu Hero" style="max-width: 150px; max-height: 100px; border-radius: 0.5rem; box-shadow: 0 2px 4px #0000001a;" />
                  </div>
                </div>
                <hr class="my-4">

                <!-- Images additionnelles (1 à 14) -->
                <p class="text-muted mb-3">Ces images sont affichées par paires sous chaque section de texte de la page 'Concept' (qui est en fait la page Boutique).</p>
                <div class="row">
                  <ng-container *ngFor="let i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label [for]="'image' + i" class="form-label">Image {{i}}</label>
                        <div class="input-group">
                          <input type="text" [id]="'image' + i" [name]="'image' + i" class="form-control" [(ngModel)]="boutique['image' + i]" (ngModelChange)="onImageFieldChange('image' + i, $event)" [placeholder]="'/assets/boutique-' + i + '.jpg'" />
                          <button type="button" class="btn btn-outline-secondary btn-sm" (click)="openLibrary('image' + i)">Lib.</button>
                        </div>
                        <div *ngIf="boutique['image' + i]" class="mt-2">
                          <img [src]="getImageUrl(boutique['image' + i])" [alt]="'Aperçu Image ' + i" style="max-width: 100px; max-height: 75px; border-radius: 0.3rem; box-shadow: 0 1px 3px #0000001a;" />
                        </div>
                      </div>
                    </div>
                    <!-- Saut de ligne après chaque paire d'images pour une meilleure lisibilité dans le formulaire -->
                    <div *ngIf="i % 2 === 0 && i !== 14" class="w-100"></div> 
                  </ng-container>
                </div>

                <hr class="my-4">
                <div class="mb-3">
                  <label for="flyerPdf" class="form-label">Fiche d'adhésion PDF (téléchargeable sur la page concept)</label>
                  <div class="input-group">
                    <input type="file" id="flyerPdf" name="flyerPdf" class="form-control" accept="application/pdf" (change)="onFlyerPdfSelected($event)" [disabled]="!!boutique.flyerPdfUrl" />
                    <button *ngIf="boutique.flyerPdfUrl" type="button" class="btn btn-outline-danger" (click)="removeFlyerPdf()">Supprimer le PDF</button>
                  </div>
                  <div *ngIf="boutique.flyerPdfUrl" class="mt-2">
                    <a [href]="apiUrl + boutique.flyerPdfUrl" target="_blank" class="btn btn-link">Télécharger la fiche actuelle</a>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" [disabled]="loading || !boutiqueForm.form.valid">{{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}</button>
              </form>
              <div *ngIf="successMsg" class="alert alert-success mt-3">{{ successMsg }}</div>
              <div *ngIf="errorMsg" class="alert alert-danger mt-3">{{ errorMsg }}</div>
            </div>
          </div>

          <!-- Modale bibliothèque d'images -->
          <div class="modal" tabindex="-1" [ngStyle]="{display: showLibrary ? 'block' : 'none'}">
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
                  <div class="pictos-gallery" style="max-height: 400px; overflow-y: auto;">
                    <div *ngFor="let picto of pictosList" style="display:inline-block; position:relative; margin:5px; padding: 5px; border:1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                      <img
                        [src]="apiUrl + picto.url"
                        (click)="selectPictoFromLibrary(picto)"
                        [class.selected]="getCurrentImageFieldValue() === picto.url"
                        [class.clickable]="true"
                        style="width:75px; height:75px; object-fit:cover; border:1px solid #eee; cursor:pointer; transition: box-shadow 0.2s, border 0.2s; border-radius: 3px;">
                      <span *ngIf="getCurrentImageFieldValue() === picto.url"
                            style="position:absolute;top:2px;right:2px;color:#28a745;font-size:18px; background: white; border-radius: 50%; padding: 0 2px;">✔</span>
                      <button (click)="removePicto(picto)" class="btn btn-danger btn-sm" style="position:absolute; bottom:2px; right:2px; padding: 0px 4px; font-size: 0.7rem;">&times;</button>
                      <div class="text-muted small" style="font-size: 0.7rem; text-align: center; max-width: 75px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ picto.originalName || 'Image' }}</div>
                    </div>
                    <div *ngIf="pictosList.length === 0" class="text-muted p-3">Aucune image dans la bibliothèque.</div>
                  </div>
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
    // Style pour la galerie d'images, similaire à d'autres composants
    `.pictos-gallery img.clickable:hover { border: 2px solid #007bff; box-shadow: 0 0 8px #007bff60; }`,
    `.pictos-gallery img.selected { border: 2px solid #28a745; box-shadow: 0 0 8px #28a74560; }`,
    `.modal { background: rgba(0,0,0,0.3); }` // Fond légèrement plus foncé pour la modale
  ]
})
export class BoutiqueComponent implements OnInit, OnDestroy {
  permissionsLoaded = false;
  hasAccess = false;
  sub: Subscription | undefined;

  boutique: any = {
    id: null,
    imageUrl: '',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    image6: '',
    image7: '',
    image8: '',
    image9: '',
    image10: '',
    image11: '',
    image12: '',
    image13: '',
    image14: ''
  };
  loading = false;
  successMsg = '';
  errorMsg = '';
  showLibrary = false;
  pictosList: any[] = [];
  apiUrl = environment.apiUrl;
  currentImageField: string = '';
  selectedFlyerPdfFile: File | null = null;

  constructor(
    private permissions: PermissionsService,
    private http: HttpClient,
    private pictosService: PictosService
  ) {}

  ngOnInit() {
    this.sub = this.permissions.getPermissions().subscribe(perms => {
      this.hasAccess = perms.some(p => p.resource === 'boutique');
      this.permissionsLoaded = true;
      if (this.hasAccess) {
        this.loadBoutique();
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  loadBoutique() {
    this.loading = true;
    this.http.get(`${this.apiUrl}/boutique`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const boutiqueData = data[0];
          for (let i = 1; i <= 14; i++) {
            boutiqueData[`image${i}`] = boutiqueData[`image${i}`] || '';
          }
          this.boutique = { ...this.boutique, ...boutiqueData };
        } else {
          for (let i = 1; i <= 14; i++) {
            this.boutique[`image${i}`] = '';
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement boutique:', err);
        this.errorMsg = 'Erreur lors du chargement des données de la boutique.';
        this.loading = false;
      }
    });
  }

  async onSubmit() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    try {
      // Si un nouveau PDF a été sélectionné, on l'upload d'abord
      if (this.selectedFlyerPdfFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFlyerPdfFile);
        const res: any = await this.http.post(`${this.apiUrl}/boutique/upload-flyer`, formData).toPromise();
        this.boutique.flyerPdfUrl = res.url || res.path || res.fileUrl;
        this.selectedFlyerPdfFile = null;
      }
    const request = this.boutique.id
      ? this.http.patch(`${this.apiUrl}/boutique/${this.boutique.id}`, this.boutique)
      : this.http.post(`${this.apiUrl}/boutique`, this.boutique);
    request.subscribe({
      next: (response: any) => {
        this.boutique = { ...this.boutique, ...response };
        this.successMsg = 'Données de la boutique enregistrées !';
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors de l\'enregistrement des données.';
        this.loading = false;
      }
    });
    } catch (error) {
      this.loading = false;
      this.errorMsg = 'Erreur lors de l\'upload du PDF';
    }
  }

  openLibrary(field: string) {
    this.currentImageField = field;
    this.showLibrary = true;
    this.loadPictos();
  }

  closeLibrary() {
    this.showLibrary = false;
    this.currentImageField = '';
  }

  loadPictos() {
    this.pictosService.getPictos().subscribe(data => this.pictosList = data);
  }

  selectPictoFromLibrary(picto: any) {
    if (this.currentImageField) {
      (this.boutique as any)[this.currentImageField] = picto.url;
      this.onImageFieldChange(this.currentImageField, picto.url);
    }
    this.closeLibrary();
  }

  removePicto(picto: any) {
    if (confirm('Supprimer cette image de la bibliothèque ? (Cela ne la retire pas du champ actuel)')) {
      this.pictosService.deletePicto(picto.id).subscribe(() => this.loadPictos());
    }
  }

  uploadPicto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pictosService.uploadPicto(file).subscribe(() => this.loadPictos());
    }
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/assets')) return this.apiUrl + url;
    if (url.startsWith('/')) return this.apiUrl + url;
    return this.apiUrl + '/' + url;
  }

  getCurrentImageFieldValue(): string {
    return this.currentImageField ? (this.boutique as any)[this.currentImageField] : '';
  }

  onImageFieldChange(field: string, value: string) {
    (this.boutique as any)[field] = value;
  }

  onFlyerPdfSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFlyerPdfFile = file;
    } else {
      alert('Veuillez sélectionner un fichier PDF.');
      this.selectedFlyerPdfFile = null;
    }
  }

  removeFlyerPdf() {
    if (confirm('Supprimer la fiche PDF ?')) {
      if (this.boutique.flyerPdfUrl) {
        this.http.delete(`${this.apiUrl}/boutique/delete-flyer`, { body: { url: this.boutique.flyerPdfUrl } }).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.boutique.flyerPdfUrl = '';
              this.selectedFlyerPdfFile = null;
            } else {
              alert(res.error || 'Erreur lors de la suppression du fichier sur le serveur.');
            }
          },
          error: () => {
            alert('Erreur lors de la suppression du fichier sur le serveur.');
          }
        });
      } else {
        this.boutique.flyerPdfUrl = '';
        this.selectedFlyerPdfFile = null;
      }
    }
  }
} 