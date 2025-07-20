import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, News } from '../../services/news.service';
import { PermissionsService } from '../../services/permissions.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PictosService } from '../../services/pictos.service';
import { UploadHttpService } from '../../services/upload-http.service';
import { environment } from '../../../environments/environment';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RichTextEditorComponent],
  template: `
    <ng-container *ngIf="permissionsLoaded">
      <ng-container *ngIf="hasAccess; else forbidden">
        <h2>Actualités</h2>
        <button class="btn btn-success mb-3" (click)="openForm()">Ajouter une actualité</button>

        <!-- Formulaire d'ajout/modification -->
        <div *ngIf="formVisible" class="card mb-4 p-3">
          <form [formGroup]="newsForm" (ngSubmit)="onSubmit()">
            <div class="mb-2">
              <label>Titre</label>
              <input class="form-control" formControlName="title" required>
            </div>
            <div class="mb-2">
              <label>Texte</label>
              <app-rich-text-editor
                [value]="convertSpansToParagraphs(newsForm.get('textContent')?.value)"
                (valueChange)="onTextContentChange($event)"
              ></app-rich-text-editor>
            </div>
            <div class="mb-2">
              <label>Image (URL)</label>
              <div class="input-group">
                <input class="form-control" formControlName="imageUrl">
                <button type="button" class="btn btn-outline-secondary" (click)="openLibrary()">Ouvrir la bibliothèque</button>
              </div>
              <div *ngIf="newsForm.get('imageUrl')?.value" class="mt-2">
                <img [src]="getImageUrl(newsForm.get('imageUrl')?.value)" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
              </div>
            </div>
            <button class="btn btn-primary me-2" type="submit" [disabled]="newsForm.invalid">
              {{ editingNews ? 'Modifier' : 'Ajouter' }}
            </button>
            <button class="btn btn-secondary" type="button" (click)="closeForm()">Annuler</button>
          </form>
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
                      [class.selected]="newsForm.get('imageUrl')?.value === picto.url"
                      [class.clickable]="true"
                      style="width:48px; height:48px; border:2px solid #eee; cursor:pointer; transition: box-shadow 0.2s, border 0.2s;">
                    <span *ngIf="newsForm.get('imageUrl')?.value === picto.url"
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

        <!-- Liste des actualités -->
        <div *ngIf="newsList.length === 0" class="text-muted">Aucune actualité pour le moment.</div>
        <div class="row">
          <div class="col-md-6 col-lg-4 mb-3" *ngFor="let news of newsList">
            <div class="card h-100">
              <img *ngIf="news.imageUrl" [src]="getImageUrl(news.imageUrl)" class="card-img-top" style="object-fit:cover;max-height:180px;">
              <div class="card-body">
                <h5 class="card-title">{{ news.title }}</h5>
                <div class="card-text" [innerHTML]="news.textContent"></div>
                <div class="text-muted mt-2" style="font-size:0.9rem;">{{ news.createdAt | date:'dd/MM/yyyy' }}</div>
              </div>
              <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary" (click)="edit(news)">Modifier</button>
                <button class="btn btn-sm btn-outline-danger" (click)="remove(news)">Supprimer</button>
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
  `
})
export class NewsComponent implements OnInit, OnDestroy {
  newsList: News[] = [];
  formVisible = false;
  editingNews: News | null = null;
  newsForm: FormGroup;
  hasAccess = false;
  permissionsLoaded = false;
  sub: Subscription;
  showLibrary = false;
  pictosList: any[] = [];
  selectedPictoId: number | null = null;
  apiUrl = environment.apiUrl;

  constructor(
    private newsService: NewsService,
    private permissions: PermissionsService,
    private fb: FormBuilder,
    private pictosService: PictosService,
    private uploadService: UploadHttpService
  ) {
    this.newsForm = this.fb.group({
      title: ['', Validators.required],
      textContent: ['', Validators.required],
      imageUrl: ['']
    });
    this.sub = this.permissions.getPermissions().subscribe(perms => {
      this.hasAccess = perms.some(p => p.resource === 'news');
      this.permissionsLoaded = true;
      if (this.hasAccess) {
        this.loadNews();
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadNews() {
    this.newsService.getAll().subscribe(news => this.newsList = news);
  }

  openForm() {
    this.formVisible = true;
    this.editingNews = null;
    this.newsForm.reset();
  }

  closeForm() {
    this.formVisible = false;
    this.editingNews = null;
    this.newsForm.reset();
  }

  edit(news: News) {
    this.formVisible = true;
    this.editingNews = news;
    this.newsForm.patchValue(news);
  }

  onSubmit() {
    if (this.newsForm.invalid) return;
    const value = this.newsForm.value;
    value.textContent = value.textContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
    if (this.editingNews) {
      this.newsService.update(this.editingNews.id, value).subscribe(() => {
        this.loadNews();
        this.closeForm();
      });
    } else {
      this.newsService.create(value).subscribe(() => {
        this.loadNews();
        this.closeForm();
      });
    }
  }

  remove(news: News) {
    if (confirm('Supprimer cette actualité ?')) {
      this.newsService.delete(news.id).subscribe(() => this.loadNews());
    }
  }

  openLibrary() {
    this.showLibrary = true;
    this.loadPictos();
  }

  closeLibrary() {
    this.showLibrary = false;
  }

  loadPictos() {
    this.pictosService.getPictos().subscribe(data => this.pictosList = data);
  }

  selectPictoFromLibrary(picto: any) {
    this.newsForm.get('imageUrl')?.setValue(picto.url);
    this.selectedPictoId = picto.id;
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
      this.uploadService.uploadPicto(file).then(() => this.loadPictos());
    }
  }

  getImageUrl(url: string): string {
    console.log('[Aperçu image actu admin]', url, '->',
      (!url) ? '' : (url.startsWith('http') ? url : (url.startsWith('/') ? this.apiUrl + url : this.apiUrl + '/' + url))
    );
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return this.apiUrl + url;
    return this.apiUrl + '/' + url;
  }
  
  onTextContentChange(value: string) {
    const spanHtml = this.convertParagraphsToSpans(value);
    this.newsForm.get('textContent')?.setValue(spanHtml);
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
} 