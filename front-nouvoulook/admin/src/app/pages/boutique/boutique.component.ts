import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PermissionsService } from '../../services/permissions.service';
import { PictosService } from '../../services/pictos.service';
import { UploadHttpService } from '../../services/upload-http.service';
import { PdfDocumentsService, PdfDocument } from '../../services/pdf-documents.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  template: `
    <ng-container *ngIf="permissionsLoaded">
      <ng-container *ngIf="hasAccess; else forbidden">
        <div class="container-fluid">
          <h2>Gestion de la page concept/boutique</h2>
          
          <!-- Image principale -->
          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">Image principale</h5>
              <div class="mb-3">
                <label for="imageUrl" class="form-label">Image principale (URL)</label>
                <div class="input-group">
                  <input type="text" id="imageUrl" name="imageUrl" class="form-control" [(ngModel)]="boutique.imageUrl" />
                  <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('imageUrl')">Ouvrir la bibliothèque</button>
                </div>
                <div *ngIf="boutique.imageUrl" class="mt-2">
                  <img [src]="getImageUrl(boutique.imageUrl)" alt="Aperçu" style="max-width: 200px; max-height: 200px;" />
                </div>
              </div>
            </div>
          </div>

          <!-- Sections dynamiques -->
          <div class="card mt-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">Sections du concept</h5>
                                 <button type="button" class="btn btn-primary" (click)="addSection()">
                   ➕ Ajouter une section
                 </button>
              </div>

              <div *ngIf="boutique.sections && boutique.sections.length > 0; else noSections">
                <div class="section-item mb-4 border rounded" *ngFor="let section of boutique.sections; let i = index">
                  <div class="section-header p-3 bg-light" (click)="toggleSection(i)" style="cursor: pointer;">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="d-flex align-items-center">
                        <span class="me-2" [class]="section.expanded ? 'rotate-90' : ''" style="transition: transform 0.2s;">▶</span>
                        <h6 class="mb-0">Section {{ i + 1 }} - {{ section.title || 'Sans titre' }}</h6>
                      </div>
                      <div>
                        <button type="button" class="btn btn-sm btn-outline-danger me-2" (click)="removeSection(section.id); $event.stopPropagation()">
                          🗑️
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary me-2" (click)="moveSection(i, -1); $event.stopPropagation()" [disabled]="i === 0">
                          ⬆️
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="moveSection(i, 1); $event.stopPropagation()" [disabled]="i === boutique.sections.length - 1">
                          ⬇️
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="section-content p-3" [ngStyle]="{display: section.expanded ? 'block' : 'none'}">

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Titre</label>
                        <input type="text" class="form-control" [(ngModel)]="section.title" />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Icône (emoji)</label>
                        <input type="text" class="form-control" [(ngModel)]="section.icon" placeholder="🤝" />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Couleur</label>
                        <select class="form-select" [(ngModel)]="section.color">
                          <option value="green">🟢 Vert</option>
                          <option value="yellow">🟡 Jaune</option>
                          <option value="pink">🩷 Rose</option>
                          <option value="blue">🔵 Bleu</option>
                          <option value="purple">🟣 Violet</option>
                          <option value="orange">🟠 Orange</option>
                          <option value="red">🔴 Rouge</option>
                          <option value="teal">🟢 Bleu-vert</option>
                          <option value="indigo">🔷 Indigo</option>
                          <option value="gray">⚪ Gris</option>
                          <option value="white">⚪ Blanc</option>
                          <option value="black">⚫ Noir</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Image 1 (optionnel)</label>
                        <div class="input-group">
                          <input type="text" class="form-control" [(ngModel)]="section.image1" />
                          <button type="button" class="btn btn-outline-secondary" (click)="openLibraryForSection(section, 'image1')">Bibliothèque</button>
                        </div>
                        <div *ngIf="section.image1" class="mt-2">
                          <img [src]="getImageUrl(section.image1)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Image 2 (optionnel)</label>
                        <div class="input-group">
                          <input type="text" class="form-control" [(ngModel)]="section.image2" />
                          <button type="button" class="btn btn-outline-secondary" (click)="openLibraryForSection(section, 'image2')">Bibliothèque</button>
                        </div>
                        <div *ngIf="section.image2" class="mt-2">
                          <img [src]="getImageUrl(section.image2)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Contenu</label>
                    <app-rich-text-editor
                      [value]="convertSpansToParagraphs(section.content)"
                      (valueChange)="section.content = convertParagraphsToSpans($event)"
                    ></app-rich-text-editor>
                  </div>
                </div>
              </div>
            </div>

              <ng-template #noSections>
                <div class="text-muted text-center py-4">
                  Aucune section pour le moment. Cliquez sur "Ajouter une section" pour commencer.
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Bibliothèque PDF -->
          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">Bibliothèque PDF</h5>
              <div class="mb-3">
                <label class="form-label">PDF sélectionné pour la page concept</label>
                <div class="input-group">
                  <input type="text" class="form-control" [value]="boutique.flyerPdfUrl ? getPdfName(boutique.flyerPdfUrl) : 'Aucun PDF sélectionné'" readonly />
                  <button type="button" class="btn btn-outline-secondary" (click)="openPdfLibrary()">Ouvrir la bibliothèque</button>
                  <button *ngIf="boutique.flyerPdfUrl" type="button" class="btn btn-outline-danger" (click)="removeFlyerPdf()">Supprimer</button>
                </div>
                <div *ngIf="boutique.flyerPdfUrl" class="mt-2">
                  <div class="alert alert-success">
                    <strong>PDF sélectionné :</strong> {{ getPdfName(boutique.flyerPdfUrl) }}
                    <br>
                    <a [href]="apiUrl + boutique.flyerPdfUrl" target="_blank" class="btn btn-sm btn-outline-primary mt-1">
                      <i class="bi bi-download me-1"></i>Télécharger
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bouton de sauvegarde -->
          <div class="mt-4">
            <button type="button" class="btn btn-primary" (click)="saveBoutique()" [disabled]="loading">
              {{ loading ? 'Enregistrement...' : 'Enregistrer toutes les modifications' }}
            </button>
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

        <!-- Modale bibliothèque PDF -->
        <div class="modal" tabindex="-1" [ngStyle]="{display: showPdfLibrary ? 'block' : 'none'}">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Bibliothèque PDF</h5>
                <button type="button" class="btn-close" (click)="closePdfLibrary()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <div class="row">
                    <div class="col-md-8">
                      <input type="file" class="form-control" accept="application/pdf" (change)="onPdfFileSelected($event)" />
                    </div>
                    <div class="col-md-4">
                      <input type="text" class="form-control" placeholder="Nom du PDF" [(ngModel)]="newPdfName" />
                    </div>
                  </div>
                  <button type="button" class="btn btn-primary mt-2" (click)="uploadPdf()" [disabled]="!selectedPdfFile || !newPdfName">
                    📤 Uploader le PDF
                  </button>
                </div>
                
                <hr>
                
                <div class="mb-2 text-muted" style="font-size: 0.95rem;">
                  Cliquez sur un PDF pour le sélectionner
                </div>
                
                <div class="pdf-gallery">
                  <div *ngFor="let pdf of pdfDocumentsList" class="pdf-item" 
                       (click)="selectPdfFromLibrary(pdf)"
                       [class.selected]="boutique.flyerPdfUrl === pdf.url">
                    <div class="pdf-icon">📄</div>
                    <div class="pdf-name">{{ pdf.name }}</div>
                    <div class="pdf-date">{{ pdf.createdAt | date:'dd/MM/yyyy' }}</div>
                    <button (click)="removePdf(pdf); $event.stopPropagation()" class="btn btn-sm btn-outline-danger">🗑️</button>
                    <span *ngIf="boutique.flyerPdfUrl === pdf.url" class="selected-indicator">✔</span>
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
    `.card { box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.10); border: none; border-radius: 1rem; }`,
    `.modal { background: rgba(0,0,0,0.2); position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:1000; }`,
    `.modal-dialog { margin-top: 10vh; }`,
    `.pictos-gallery img.clickable:hover { border: 2px solid #ffa14e; box-shadow: 0 0 8px #ffa14e; }`,
    `.pictos-gallery img.selected { border: 2px solid #28a745; box-shadow: 0 0 8px #28a745; }`,
    `.section-item { background-color: #f8f9fa; }`,
    `.rotate-90 { transform: rotate(90deg); }`,
    `.section-header:hover { background-color: #e9ecef !important; }`,
    `.pdf-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }`,
    `.pdf-item { 
      border: 2px solid #eee; 
      border-radius: 12px; 
      padding: 1.5rem; 
      cursor: pointer; 
      transition: all 0.3s; 
      position: relative;
      background: #fff;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }`,
    `.pdf-item:hover { border-color: #007bff; box-shadow: 0 4px 12px rgba(0,123,255,0.15); transform: translateY(-2px); }`,
    `.pdf-item.selected { border-color: #28a745; background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%); }`,
    `.pdf-icon { font-size: 2.5rem; text-align: center; margin-bottom: 0.75rem; }`,
    `.pdf-name { font-weight: 700; text-align: center; margin-bottom: 0.5rem; font-size: 1.1rem; color: #333; line-height: 1.3; }`,
    `.pdf-date { font-size: 0.85rem; color: #888; text-align: center; font-style: italic; }`,
    `.selected-indicator { 
      position: absolute; 
      top: 0.5rem; 
      right: 0.5rem; 
      color: #28a745; 
      font-size: 1.2rem; 
      font-weight: bold; 
    }`
  ]
})
export class BoutiqueComponent implements OnInit, OnDestroy {
  permissionsLoaded = false;
  hasAccess = false;
  sub: Subscription | undefined;

  boutique: any = {
    id: null,
    imageUrl: '',
    sections: [],
    flyerPdfUrl: ''
  };
  loading = false;
  successMsg = '';
  errorMsg = '';
  showLibrary = false;
  showPdfLibrary = false;
  pictosList: any[] = [];
  pdfDocumentsList: PdfDocument[] = [];
  apiUrl = environment.apiUrl;
  currentImageField: string = '';
  currentSection: any = null;
  selectedFlyerPdfFile: File | null = null;
  selectedPdfFile: File | null = null;
  newPdfName: string = '';

  constructor(
    private permissions: PermissionsService,
    private http: HttpClient,
    private pictosService: PictosService,
    private uploadService: UploadHttpService,
    private pdfDocumentsService: PdfDocumentsService
  ) {}

  ngOnInit() {
    this.sub = this.permissions.getPermissions().subscribe(perms => {
      this.hasAccess = perms.some(p => p.resource === 'boutique');
      this.permissionsLoaded = true;
      if (this.hasAccess) {
        this.loadBoutique();
        this.loadPdfDocuments(); // Charger les PDFs au démarrage
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
          this.boutique = data[0];
          if (!this.boutique.sections) {
            this.boutique.sections = [];
          }
        } else {
          this.boutique = { imageUrl: '', sections: [], flyerPdfUrl: '' };
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

  async saveBoutique() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    
    try {
      // Si un nouveau PDF a été sélectionné, on l'upload d'abord
      console.log('selectedFlyerPdfFile:', this.selectedFlyerPdfFile);
      if (this.selectedFlyerPdfFile) {
        console.log('Uploading PDF file:', this.selectedFlyerPdfFile.name);
        const formData = new FormData();
        formData.append('file', this.selectedFlyerPdfFile);
        console.log('FormData created, sending to server...');
        
        // Créer une requête HTTP sans l'intercepteur pour éviter le content-type JSON
        const res: any = await fetch(`${this.apiUrl}/boutique/upload-flyer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }).then(response => response.json());
        
        console.log('Upload response:', res);
        this.boutique.flyerPdfUrl = res.url;
        this.selectedFlyerPdfFile = null;
      } else {
        console.log('No PDF file selected for upload');
      }

      // Sauvegarder la boutique principale
      const boutiqueRequest = this.boutique.id
        ? this.http.patch(`${this.apiUrl}/boutique/${this.boutique.id}`, this.boutique)
        : this.http.post(`${this.apiUrl}/boutique`, this.boutique);

      boutiqueRequest.subscribe({
        next: async (response: any) => {
          // Garder les sections locales et mettre à jour seulement les autres champs
          const currentSections = this.boutique.sections || [];
          this.boutique = { ...this.boutique, ...response };
          this.boutique.sections = currentSections;
          
          // Sauvegarder chaque section modifiée
          if (this.boutique.sections && this.boutique.sections.length > 0) {
            const sectionPromises = this.boutique.sections.map((section: any) => {
              // Filtrer la propriété 'expanded' qui n'existe pas en base
              const { expanded, ...sectionData } = section;
              
              if (section.id) {
                // Section existante, la mettre à jour
                return this.http.patch(`${this.apiUrl}/boutique/sections/${section.id}`, sectionData).toPromise();
              } else {
                // Nouvelle section, la créer
                return this.http.post(`${this.apiUrl}/boutique/${this.boutique.id}/sections`, sectionData).toPromise();
              }
            });
            
            try {
              const savedSections = await Promise.all(sectionPromises);
              // Mettre à jour les IDs des nouvelles sections
              this.boutique.sections = this.boutique.sections.map((section: any, index: number) => {
                if (!section.id && savedSections[index]) {
                  return { ...section, id: savedSections[index].id };
                }
                return section;
              });
              this.successMsg = 'Données de la boutique et des sections enregistrées !';
              alert('Les modifications ont été mises à jour avec succès !');
            } catch (sectionError) {
              console.error('Erreur détaillée:', sectionError);
              this.errorMsg = 'Erreur lors de l\'enregistrement des sections.';
              alert('Erreur lors de l\'enregistrement des sections.');
            }
          } else {
            this.successMsg = 'Données de la boutique enregistrées !';
            alert('Les modifications ont été mises à jour avec succès !');
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur détaillée:', error);
          this.errorMsg = 'Erreur lors de l\'enregistrement des données.';
          alert('Erreur lors de l\'enregistrement des données.');
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      this.loading = false;
      this.errorMsg = 'Erreur lors de l\'upload du PDF';
    }
  }

  addSection() {
    const newSection = {
      title: 'Nouvelle section',
      content: '<span>Contenu de la nouvelle section...</span>',
      icon: '📝',
      color: 'green',
      image1: '',
      image2: '',
      order: this.boutique.sections.length,
      expanded: true
    };
    
    // Ajouter localement d'abord
    this.boutique.sections.push(newSection);
    
    // Si la boutique existe déjà, sauvegarder immédiatement
    if (this.boutique.id) {
      this.saveBoutique();
    }
  }

  removeSection(sectionId: string) {
    if (confirm('Supprimer cette section ?')) {
      // Supprimer localement d'abord
      this.boutique.sections = this.boutique.sections.filter((s: any) => s.id !== sectionId);
      
      // Si la boutique existe et la section avait un ID, supprimer via l'API
      if (sectionId && this.boutique.id) {
        this.http.delete(`${this.apiUrl}/boutique/sections/${sectionId}`).subscribe({
          error: () => {
            this.errorMsg = 'Erreur lors de la suppression de la section.';
          }
        });
      }
    }
  }

  moveSection(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.boutique.sections.length) {
      const sections = [...this.boutique.sections];
      const temp = sections[index];
      sections[index] = sections[newIndex];
      sections[newIndex] = temp;
      
      // Mettre à jour l'ordre
      sections.forEach((section, i) => {
        section.order = i;
      });
      
      this.boutique.sections = sections;
      
      // Sauvegarder l'ordre si la boutique existe
      if (this.boutique.id) {
        const reorderData = sections.map((s, i) => ({ id: s.id, order: i }));
        this.http.post(`${this.apiUrl}/boutique/sections/reorder`, reorderData).subscribe();
      }
    }
  }

  openLibrary(field: string) {
    this.currentImageField = field;
    this.currentSection = null;
    this.showLibrary = true;
    this.loadPictos();
  }

  openLibraryForSection(section: any, field: string) {
    this.currentImageField = field;
    this.currentSection = section;
    this.showLibrary = true;
    this.loadPictos();
  }

  closeLibrary() {
    this.showLibrary = false;
    this.currentImageField = '';
    this.currentSection = null;
  }

  loadPictos() {
    this.pictosService.getPictos().subscribe(data => this.pictosList = data);
  }

  selectPictoFromLibrary(picto: any) {
    if (this.currentSection) {
      // Section spécifique
      this.currentSection[this.currentImageField] = picto.url;
    } else {
      // Image principale de la boutique
      this.boutique[this.currentImageField] = picto.url;
    }
    this.closeLibrary();
  }

  removePicto(picto: any) {
    if (confirm('Supprimer cette image de la bibliothèque ?')) {
      this.pictosService.deletePicto(picto.id).subscribe(() => this.loadPictos());
    }
  }

  uploadPicto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadService.uploadPicto(file).then(() => this.loadPictos());
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
    if (this.currentSection) {
      return this.currentSection[this.currentImageField] || '';
    }
    return this.boutique[this.currentImageField] || '';
  }

  onContentChange(section: any, value: string) {
    // Convertir les paragraphes en spans pour la sauvegarde
    const spanHtml = this.convertParagraphsToSpans(value);
    section.content = spanHtml;
  }

  toggleSection(index: number) {
    if (this.boutique.sections[index]) {
      this.boutique.sections[index].expanded = !this.boutique.sections[index].expanded;
    }
  }

  convertParagraphsToSpans(html: string): string {
    if (!html) return '';
    
    // Créer un élément temporaire pour manipuler le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remplacer les paragraphes par des spans avec sauts de ligne
    const paragraphs = tempDiv.querySelectorAll('p');
    
    paragraphs.forEach((p, index) => {
      const span = document.createElement('span');
      span.innerHTML = p.innerHTML;
      span.className = p.className;
      span.style.cssText = p.style.cssText;
      
      // Ajouter un saut de ligne après chaque span (sauf le dernier)
      if (index < paragraphs.length - 1) {
        const br = document.createElement('br');
        p.parentNode?.insertBefore(br, p.nextSibling);
      }
      
      p.parentNode?.replaceChild(span, p);
    });
    
    return tempDiv.innerHTML;
  }

  convertSpansToParagraphs(html: string): string {
    if (!html) return '';
    
    // Créer un élément temporaire pour manipuler le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remplacer les spans par des paragraphes
    const spans = tempDiv.querySelectorAll('span');
    spans.forEach((span) => {
      const paragraph = document.createElement('p');
      paragraph.innerHTML = span.innerHTML;
      paragraph.className = span.className;
      paragraph.style.cssText = span.style.cssText;
      
      // Remplacer le span par le paragraphe
      span.parentNode?.replaceChild(paragraph, span);
    });
    
    // Supprimer les <br> qui ne sont plus nécessaires
    const breaks = tempDiv.querySelectorAll('br');
    breaks.forEach(br => {
      const nextElement = br.nextElementSibling;
      if (nextElement && nextElement.tagName === 'P') {
        br.remove();
      }
    });
    
    return tempDiv.innerHTML;
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
    if (confirm('Supprimer la charte PDF ?')) {
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

  // Méthodes pour la bibliothèque PDF
  getPdfName(url: string): string {
    const pdf = this.pdfDocumentsList.find(p => p.url === url);
    return pdf ? pdf.name : 'PDF inconnu';
  }

  openPdfLibrary() {
    this.showPdfLibrary = true;
    this.loadPdfDocuments();
  }

  closePdfLibrary() {
    this.showPdfLibrary = false;
    this.selectedPdfFile = null;
    this.newPdfName = '';
  }

  onPdfFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedPdfFile = file;
      if (!this.newPdfName) {
        this.newPdfName = file.name.replace('.pdf', '');
      }
    } else {
      alert('Veuillez sélectionner un fichier PDF.');
      this.selectedPdfFile = null;
    }
  }

  async uploadPdf() {
    if (!this.selectedPdfFile || !this.newPdfName) {
      alert('Veuillez sélectionner un fichier PDF et donner un nom.');
      return;
    }

    try {
      const pdf = await this.pdfDocumentsService.uploadPdf(this.selectedPdfFile, this.newPdfName);
      this.pdfDocumentsList.unshift(pdf);
      this.selectedPdfFile = null;
      this.newPdfName = '';
      alert('PDF uploadé avec succès !');
    } catch (error) {
      console.error('Erreur upload PDF:', error);
      alert('Erreur lors de l\'upload du PDF.');
    }
  }

  selectPdfFromLibrary(pdf: PdfDocument) {
    this.boutique.flyerPdfUrl = pdf.url;
    this.closePdfLibrary();
    // Sauvegarder automatiquement après la sélection
    this.saveBoutique();
    this.successMsg = `PDF "${pdf.name}" sélectionné et sauvegardé !`;
  }

  removePdf(pdf: PdfDocument) {
    if (confirm(`Supprimer le PDF "${pdf.name}" ?`)) {
      this.pdfDocumentsService.deletePdf(pdf.id).subscribe({
        next: () => {
          this.pdfDocumentsList = this.pdfDocumentsList.filter(p => p.id !== pdf.id);
          if (this.boutique.flyerPdfUrl === pdf.url) {
            this.boutique.flyerPdfUrl = '';
          }
          alert('PDF supprimé avec succès !');
        },
        error: () => {
          alert('Erreur lors de la suppression du PDF.');
        }
      });
    }
  }

  loadPdfDocuments() {
    this.pdfDocumentsService.getPdfDocuments().subscribe(data => {
      this.pdfDocumentsList = data;
    });
  }
} 