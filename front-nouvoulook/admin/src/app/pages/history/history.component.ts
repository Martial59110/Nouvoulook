import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermissionsService } from '../../services/permissions.service';
import { PictosService } from '../../services/pictos.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="!hasHistoryAccess" class="alert alert-danger mt-4">Accès interdit : vous n'avez pas la permission d'accéder à cette page.</div>
    <div *ngIf="hasHistoryAccess" class="container-fluid">
      <h2>Gestion de la page Histoire</h2>
      <div class="card mt-4">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #historyForm="ngForm" autocomplete="off">
            <!-- Image principale -->
            <div class="mb-3">
              <label for="imageUrl" class="form-label">Image principale (hero)</label>
              <div class="input-group">
                <input type="text" id="imageUrl" name="imageUrl" class="form-control" [(ngModel)]="history.imageUrl" (ngModelChange)="onImageFieldChange('imageUrl', $event)" placeholder="/assets/histoire.jpg" />
                <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('imageUrl')">Ouvrir la bibliothèque</button>
              </div>
              <div *ngIf="history.imageUrl" class="mt-2">
                <img [src]="getImageUrl(history.imageUrl)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
              </div>
            </div>
            <!-- Image 1 -->
            <div class="mb-3">
              <label for="image1" class="form-label">Image 1 (bloc 1)</label>
              <div class="input-group">
                <input type="text" id="image1" name="image1" class="form-control" [(ngModel)]="history.image1" (ngModelChange)="onImageFieldChange('image1', $event)" placeholder="/assets/image1.jpg" />
                <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('image1')">Ouvrir la bibliothèque</button>
              </div>
              <div *ngIf="history.image1" class="mt-2">
                <img [src]="getImageUrl(history.image1)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
              </div>
            </div>
            <!-- Texte 1 -->
            <div class="mb-3">
              <label for="textContent" class="form-label">Texte 1</label>
              <textarea id="textContent" name="textContent" class="form-control" rows="4" [(ngModel)]="history.textContent"></textarea>
            </div>
            <!-- Image 2 -->
            <div class="mb-3">
              <label for="image2" class="form-label">Image 2 (bloc 2)</label>
              <div class="input-group">
                <input type="text" id="image2" name="image2" class="form-control" [(ngModel)]="history.image2" (ngModelChange)="onImageFieldChange('image2', $event)" placeholder="/assets/image2.jpg" />
                <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('image2')">Ouvrir la bibliothèque</button>
              </div>
              <div *ngIf="history.image2" class="mt-2">
                <img [src]="getImageUrl(history.image2)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
              </div>
            </div>
            <!-- Texte 2 -->
            <div class="mb-3">
              <label for="textContent2" class="form-label">Texte 2</label>
              <textarea id="textContent2" name="textContent2" class="form-control" rows="4" [(ngModel)]="history.textContent2"></textarea>
            </div>
            <!-- Image 3 -->
            <div class="mb-3">
              <label for="image3" class="form-label">Image 3 (bloc 3)</label>
              <div class="input-group">
                <input type="text" id="image3" name="image3" class="form-control" [(ngModel)]="history.image3" (ngModelChange)="onImageFieldChange('image3', $event)" placeholder="/assets/image3.jpg" />
                <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('image3')">Ouvrir la bibliothèque</button>
              </div>
              <div *ngIf="history.image3" class="mt-2">
                <img [src]="getImageUrl(history.image3)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
              </div>
            </div>
            <!-- Texte 3 -->
            <div class="mb-3">
              <label for="textContent3" class="form-label">Texte 3</label>
              <textarea id="textContent3" name="textContent3" class="form-control" rows="4" [(ngModel)]="history.textContent3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="loading">{{ loading ? 'Enregistrement...' : 'Enregistrer' }}</button>
          </form>
          <div *ngIf="successMsg" class="alert alert-success mt-3">{{ successMsg }}</div>
          <div *ngIf="errorMsg" class="alert alert-danger mt-3">{{ errorMsg }}</div>
        </div>
      </div>
      <!-- Modale bibliothèque d'images -->
      <div class="modal" tabindex="-1" [ngStyle]="{display: showLibrary ? 'block' : 'none'}">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Bibliothèque d'images</h5>
              <button type="button" class="btn-close" (click)="closeLibrary()"></button>
            </div>
            <div class="modal-body">
              <div class="mb-2 text-muted" style="font-size: 0.95rem;">
                Cliquez sur une image pour la sélectionner
              </div>
              <div class="mb-3">
                <a href="https://svgsilh.com/" target="_blank" class="btn btn-outline-primary btn-sm">
                  <span class="material-icons" style="font-size: 16px; vertical-align: middle;">link</span>
                  Trouver des icônes libres de droit sur svgsilh.com
                </a>
              </div>
              <div class="pictos-gallery">
                <div *ngFor="let picto of pictosList" style="display:inline-block; position:relative; margin:4px;">
                  <img
                    [src]="apiUrl + picto.url"
                    (click)="selectPictoFromLibrary(picto)"
                    [class.selected]="getCurrentImageFieldValue() === picto.url"
                    [class.clickable]="true"
                    style="width:48px; height:48px; border:2px solid #eee; cursor:pointer; transition: box-shadow 0.2s, border 0.2s;">
                  <span *ngIf="getCurrentImageFieldValue() === picto.url"
                        style="position:absolute;top:2px;right:2px;color:#28a745;font-size:18px;">✔</span>
                  <button (click)="removePicto(picto)" style="position:absolute; top:0; right:0; background:transparent; border:none; color:red; font-size:18px;">&times;</button>
                </div>
              </div>
              <div class="mt-3">
                <input type="file" (change)="uploadPicto($event)">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit, OnDestroy {
  history: any = {
    imageUrl: '',
    image1: '',
    image2: '',
    image3: '',
    textContent: '',
    textContent2: '',
    textContent3: ''
  };
  loading = false;
  successMsg = '';
  errorMsg = '';
  hasHistoryAccess = false;
  showLibrary = false;
  pictosList: any[] = [];
  apiUrl = environment.apiUrl;
  currentImageField: string = '';

  constructor(private http: HttpClient, private permissions: PermissionsService, private pictosService: PictosService) {}

  ngOnInit() {
    this.hasHistoryAccess = this.permissions.hasAccess('history');
    if (!this.hasHistoryAccess) return;
    this.loadHistory();
  }

  ngOnDestroy() {}

  loadHistory() {
    this.http.get(`${environment.apiUrl}/history`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) this.history = { ...this.history, ...data[0] };
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.http.patch(`${environment.apiUrl}/history/${this.history.id || ''}`, this.history).subscribe({
      next: () => {
        this.successMsg = 'Histoire enregistrée !';
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors de l\'enregistrement.';
        this.loading = false;
      }
    });
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
      this.history[this.currentImageField] = picto.url;
    }
    this.closeLibrary();
  }

  removePicto(picto: any) {
    if (confirm('Supprimer cette image ?')) {
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
    if (url.startsWith('/')) return this.apiUrl + url;
    return this.apiUrl + '/' + url;
  }

  getCurrentImageFieldValue(): string {
    return this.currentImageField ? this.history[this.currentImageField] : '';
  }

  onImageFieldChange(field: string, value: string) {
    this.history[field] = value;
  }
} 