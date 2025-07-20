import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermissionsService } from '../../services/permissions.service';
import { PictosService } from '../../services/pictos.service';
import { UploadHttpService } from '../../services/upload-http.service';
import { TimelineService, TimelineItem } from '../../services/timeline.service';
import { HistorySectionsService, HistorySection } from '../../services/history-sections.service';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
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
            <!-- Section Gestion des sections -->
            <div class="mt-5">
              <h3>Gestion des sections texte + image</h3>
              <button class="btn btn-success mb-3" (click)="openSectionsForm()">Ajouter une section</button>
              
              <!-- Formulaire Section -->
              <div *ngIf="sectionsFormVisible" class="card mb-4 p-3">
                <form (ngSubmit)="onSectionSubmit()" #sectionForm="ngForm">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="sectionOrder" class="form-label">Ordre d'affichage</label>
                        <input type="number" id="sectionOrder" name="order" class="form-control" [(ngModel)]="currentSection.order" required min="1">
                      </div>
                    </div>
                    <div class="col-md-6">
            <div class="mb-3">
                        <label for="sectionImage" class="form-label">Image</label>
              <div class="input-group">
                          <input type="text" id="sectionImage" name="imageUrl" class="form-control" [(ngModel)]="currentSection.imageUrl" placeholder="/assets/image.jpg" />
                          <button type="button" class="btn btn-outline-secondary" (click)="openLibrary('sectionImage')">Ouvrir la bibliothèque</button>
                        </div>
                        <div *ngIf="currentSection.imageUrl" class="mt-2">
                          <img [src]="getImageUrl(currentSection.imageUrl)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="sectionText" class="form-label">Texte</label>
                    <app-rich-text-editor
                      [value]="convertSpansToParagraphs(currentSection.textContent || '')"
                      (valueChange)="onSectionTextChange($event)"
                    ></app-rich-text-editor>
                  </div>
                  <button class="btn btn-primary me-2" type="submit" [disabled]="sectionForm.invalid || sectionsLoading">
                    {{ sectionsLoading ? 'Enregistrement...' : (editingSectionId ? 'Modifier' : 'Ajouter') }}
                  </button>
                  <button class="btn btn-secondary" type="button" (click)="closeSectionsForm()">Annuler</button>
                </form>
              </div>
              
              <!-- Liste des sections -->
              <div class="row">
                <div class="col-md-6 col-lg-4 mb-3" *ngFor="let section of history.sections; let i = index">
                  <div class="card h-100">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">Section {{ section.order }}</h6>
                        <span class="badge" [class]="i % 2 === 0 ? 'bg-primary' : 'bg-success'">
                          {{ i % 2 === 0 ? 'Gauche' : 'Droite' }}
                        </span>
                      </div>
                      <img *ngIf="section.imageUrl" [src]="getImageUrl(section.imageUrl)" class="card-img-top mb-2" style="object-fit:cover;max-height:120px;">
                      <div class="card-text" [innerHTML]="section.textContent"></div>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                      <button class="btn btn-sm btn-outline-primary" (click)="editSection(section)">Modifier</button>
                      <button class="btn btn-sm btn-outline-danger" (click)="removeSection(section)">Supprimer</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="loading">{{ loading ? 'Enregistrement...' : 'Enregistrer' }}</button>
          </form>
          
          <!-- Section Timeline -->
          <div class="mt-5">
            <h3>Gestion de la Timeline</h3>
            <button class="btn btn-success mb-3" (click)="openTimelineForm()">Ajouter un point de timeline</button>
            
            <!-- Formulaire Timeline -->
            <div *ngIf="timelineFormVisible" class="card mb-4 p-3">
              <form (ngSubmit)="onTimelineSubmit()" #timelineForm="ngForm">
                <div class="row">
                  <div class="col-md-6">
            <div class="mb-3">
                      <label for="year" class="form-label">Année</label>
                      <input type="text" id="year" name="year" class="form-control" [(ngModel)]="timelineItem.year" required>
                    </div>
            </div>
                  <div class="col-md-6">
            <div class="mb-3">
                      <label for="color" class="form-label">Couleur</label>
                      <input type="color" id="color" name="color" class="form-control" [(ngModel)]="timelineItem.color">
              </div>
              </div>
            </div>
                <div class="mb-3">
                  <label for="icon" class="form-label">Icône (classe Bootstrap Icons)</label>
                  <select id="icon" name="icon" class="form-control" [(ngModel)]="timelineItem.icon">
                    <option value="bi-star-fill">⭐ Étoile</option>
                    <option value="bi-heart-fill">❤️ Cœur</option>
                    <option value="bi-people-fill">👥 Personnes</option>
                    <option value="bi-lightbulb-fill">💡 Ampoule</option>
                    <option value="bi-award-fill">🏆 Trophée</option>
                    <option value="bi-house-fill">🏠 Maison</option>
                    <option value="bi-briefcase-fill">💼 Mallette</option>
                    <option value="bi-gem-fill">💎 Gemme</option>
                    <option value="bi-rocket-fill">🚀 Fusée</option>
                    <option value="bi-flag-fill">🚩 Drapeau</option>
                  </select>
                </div>
            <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea id="description" name="description" class="form-control" rows="3" [(ngModel)]="timelineItem.description" required></textarea>
                </div>
                <button class="btn btn-primary me-2" type="submit" [disabled]="timelineForm.invalid || timelineLoading">
                  {{ timelineLoading ? 'Enregistrement...' : (editingTimelineId ? 'Modifier' : 'Ajouter') }}
                </button>
                <button class="btn btn-secondary" type="button" (click)="closeTimelineForm()">Annuler</button>
              </form>
            </div>
            
            <!-- Liste des points de timeline -->
            <div class="row">
              <div class="col-md-6 col-lg-4 mb-3" *ngFor="let item of timelineItems">
                <div class="card h-100">
                  <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                      <div class="timeline-icon-preview me-2" [style.background-color]="item.color">
                        <i [class]="item.icon"></i>
                      </div>
                      <h6 class="card-title mb-0">{{ item.year }}</h6>
                    </div>
                    <p class="card-text">{{ item.description }}</p>
                  </div>
                  <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary" (click)="editTimelineItem(item)">Modifier</button>
                    <button class="btn btn-sm btn-outline-danger" (click)="removeTimelineItem(item)">Supprimer</button>
                  </div>
              </div>
              </div>
            </div>
            </div>
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
  `,
  styles: [
    `.card { box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.10); border: none; border-radius: 1rem; }`,
    `.modal { background: rgba(0,0,0,0.2); position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:1000; }`,
    `.modal-dialog { margin-top: 10vh; }`,
    `.pictos-gallery img.clickable:hover { border: 2px solid #ffa14e; box-shadow: 0 0 8px #ffa14e; }`,
    `.pictos-gallery img.selected { border: 2px solid #28a745; box-shadow: 0 0 8px #28a745; }`,
    `.timeline-icon-preview { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1rem; }`
  ]
})
export class HistoryComponent implements OnInit, OnDestroy {
  history: any = {
    imageUrl: '',
    sections: []
  };
  loading = false;
  successMsg = '';
  errorMsg = '';
  hasHistoryAccess = false;
  showLibrary = false;
  pictosList: any[] = [];
  apiUrl = environment.apiUrl;
  currentImageField: string = '';

  // Timeline properties
  timelineItems: TimelineItem[] = [];
  timelineFormVisible = false;
  timelineLoading = false;
  editingTimelineId: string | null = null;
  timelineItem: Partial<TimelineItem> = {
    year: '',
    description: '',
    icon: 'bi-star-fill',
    color: '#E23E57'
  };
  
  // History sections properties
  sectionsFormVisible = false;
  sectionsLoading = false;
  editingSectionId: string | null = null;
  currentSection: Partial<HistorySection> = {
    order: 1,
    imageUrl: '',
    textContent: ''
  };

  constructor(
    private http: HttpClient, 
    private permissions: PermissionsService, 
    private pictosService: PictosService,
    private uploadService: UploadHttpService,
    private timelineService: TimelineService,
    private historySectionsService: HistorySectionsService
  ) {}

  ngOnInit() {
    this.hasHistoryAccess = this.permissions.hasAccess('history');
    if (!this.hasHistoryAccess) return;
    this.loadHistory();
    this.loadTimelineItems();
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
      if (this.currentImageField === 'sectionImage') {
        // Pour les sections d'histoire
        this.currentSection.imageUrl = picto.url;
      } else {
        // Pour l'image principale
        this.history[this.currentImageField] = picto.url;
      }
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
      this.uploadService.uploadPicto(file).then((response: any) => {
        this.loadPictos();
        this.successMsg = 'Image uploadée avec succès !';
      }).catch((error: any) => {
        this.errorMsg = 'Erreur lors de l\'upload de l\'image.';
      });
    }
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return this.apiUrl + url;
    return this.apiUrl + '/' + url;
  }

  getCurrentImageFieldValue(): string {
    if (!this.currentImageField) return '';
    
    if (this.currentImageField === 'sectionImage') {
      // Pour les sections d'histoire
      return this.currentSection.imageUrl || '';
    } else {
      // Pour l'image principale
      return this.history[this.currentImageField] || '';
    }
  }

  onImageFieldChange(field: string, value: string) {
    this.history[field] = value;
  }
  
  onTextContent3Change(value: string) {
    this.history.textContent3 = value;
  }
  
  // Timeline methods
  loadTimelineItems() {
    this.timelineService.getAll().subscribe({
      next: (items) => {
        this.timelineItems = items.sort((a, b) => parseInt(a.year) - parseInt(b.year));
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la timeline:', error);
      }
    });
  }
  
  openTimelineForm() {
    this.timelineFormVisible = true;
    this.editingTimelineId = null;
    this.timelineItem = {
      year: '',
      description: '',
      icon: 'bi-star-fill',
      color: '#E23E57'
    };
  }
  
  closeTimelineForm() {
    this.timelineFormVisible = false;
    this.editingTimelineId = null;
    this.timelineItem = {
      year: '',
      description: '',
      icon: 'bi-star-fill',
      color: '#E23E57'
    };
  }
  
  onTimelineSubmit() {
    if (!this.timelineItem.year || !this.timelineItem.description) return;
    
    this.timelineLoading = true;
    
    if (this.editingTimelineId) {
      // Update existing item
      this.timelineService.update(this.editingTimelineId, this.timelineItem).subscribe({
        next: () => {
          this.loadTimelineItems();
          this.closeTimelineForm();
          this.timelineLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.timelineLoading = false;
        }
      });
    } else {
      // Create new item
      this.timelineService.create(this.timelineItem).subscribe({
        next: () => {
          this.loadTimelineItems();
          this.closeTimelineForm();
          this.timelineLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.timelineLoading = false;
        }
      });
    }
  }
  
  editTimelineItem(item: TimelineItem) {
    this.timelineFormVisible = true;
    this.editingTimelineId = item.id;
    this.timelineItem = { ...item };
  }
  
  removeTimelineItem(item: TimelineItem) {
    if (confirm('Supprimer ce point de timeline ?')) {
      this.timelineService.delete(item.id).subscribe({
        next: () => {
          this.loadTimelineItems();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
  
  // History sections methods
  openSectionsForm() {
    this.sectionsFormVisible = true;
    this.editingSectionId = null;
    this.currentSection = {
      order: this.history.sections.length + 1,
      imageUrl: '',
      textContent: ''
    };
  }
  
  closeSectionsForm() {
    this.sectionsFormVisible = false;
    this.editingSectionId = null;
    this.currentSection = {
      order: 1,
      imageUrl: '',
      textContent: ''
    };
  }
  
  onSectionSubmit() {
    if (!this.currentSection.order || !this.history.id) return;
    
    this.sectionsLoading = true;
    
    if (this.editingSectionId) {
      // Update existing section
      this.historySectionsService.update(this.editingSectionId, this.currentSection).subscribe({
        next: () => {
          this.loadHistory();
          this.closeSectionsForm();
          this.sectionsLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la section:', error);
          this.sectionsLoading = false;
        }
      });
    } else {
      // Create new section
      this.historySectionsService.create(this.history.id, this.currentSection).subscribe({
        next: () => {
          this.loadHistory();
          this.closeSectionsForm();
          this.sectionsLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création de la section:', error);
          this.sectionsLoading = false;
        }
      });
    }
  }
  
  onSectionTextChange(value: string) {
    const spanHtml = this.convertParagraphsToSpans(value);
    this.currentSection.textContent = spanHtml;
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
  
  editSection(section: HistorySection) {
    this.sectionsFormVisible = true;
    this.editingSectionId = section.id;
    this.currentSection = { ...section };
  }
  
  removeSection(section: HistorySection) {
    if (confirm('Supprimer cette section ?')) {
      this.historySectionsService.delete(section.id).subscribe({
        next: () => {
          this.loadHistory();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la section:', error);
        }
      });
    }
  }
} 