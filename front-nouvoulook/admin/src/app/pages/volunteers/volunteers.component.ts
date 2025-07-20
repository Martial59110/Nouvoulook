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
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  template: `
    <ng-container *ngIf="permissionsLoaded">
      <ng-container *ngIf="hasAccess; else forbidden">
        <div class="container-fluid">
          <h2>Gestion de la page bénévoles</h2>
          
          <div class="card mt-4">
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #volunteerForm="ngForm">
                <div class="mb-3">
                  <label for="textContent" class="form-label">Contenu de la page</label>
                  <app-rich-text-editor
                    [value]="convertSpansToParagraphs(textVolunteer.textContent)"
                    (valueChange)="onTextContentChange($event)"
                  ></app-rich-text-editor>
                  <div class="form-text">Ce texte sera affiché sur la page des bénévoles. Utilisez les outils de formatage ci-dessus pour mettre en forme votre texte.</div>
                </div>

                <div class="mb-3">
                  <label for="imageUrl" class="form-label">Image (URL)</label>
                  <div class="input-group">
                    <input type="text" id="imageUrl" name="imageUrl" class="form-control" [(ngModel)]="textVolunteer.imageUrl" />
                    <button type="button" class="btn btn-outline-secondary" (click)="openLibrary()">Ouvrir la bibliothèque</button>
                  </div>
                  <div *ngIf="textVolunteer.imageUrl" class="mt-2">
                    <img [src]="apiUrl + textVolunteer.imageUrl" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
                  </div>
                </div>

                <!-- Bibliothèque PDF -->
                <div class="card mt-4">
                  <div class="card-body">
                    <h5 class="card-title">Bibliothèque PDF</h5>
                    <div class="mb-3">
                      <label class="form-label">PDF sélectionné pour la page bénévolat</label>
                      <div class="input-group">
                        <input type="text" class="form-control" [value]="textVolunteer.flyerPdfUrl ? getPdfName(textVolunteer.flyerPdfUrl) : 'Aucun PDF sélectionné'" readonly />
                        <button type="button" class="btn btn-outline-secondary" (click)="openPdfLibrary()">Ouvrir la bibliothèque</button>
                        <button *ngIf="textVolunteer.flyerPdfUrl" type="button" class="btn btn-outline-danger" (click)="removeFlyerPdf()">Supprimer</button>
                      </div>
                      <div *ngIf="textVolunteer.flyerPdfUrl" class="mt-2">
                        <div class="alert alert-success">
                          <strong>PDF sélectionné :</strong> {{ getPdfName(textVolunteer.flyerPdfUrl) }}
                          <br>
                          <a [href]="apiUrl + textVolunteer.flyerPdfUrl" target="_blank" class="btn btn-sm btn-outline-primary mt-1">
                            <i class="bi bi-download me-1"></i>Télécharger
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" [disabled]="!volunteerForm.form.valid || loading">
                  {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </form>
            </div>
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
                      [class.selected]="textVolunteer.imageUrl === picto.url"
                      [class.clickable]="true"
                      style="width:48px; height:48px; border:2px solid #eee; cursor:pointer; transition: box-shadow 0.2s, border 0.2s;">
                    <span *ngIf="textVolunteer.imageUrl === picto.url"
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
                       [class.selected]="textVolunteer.flyerPdfUrl === pdf.url">
                    <div class="pdf-icon">📄</div>
                    <div class="pdf-name">{{ pdf.name }}</div>
                    <div class="pdf-date">{{ pdf.createdAt | date:'dd/MM/yyyy' }}</div>
                    <button (click)="removePdf(pdf); $event.stopPropagation()" class="btn btn-sm btn-outline-danger">🗑️</button>
                    <span *ngIf="textVolunteer.flyerPdfUrl === pdf.url" class="selected-indicator">✔</span>
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
    `.pdf-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }`,
    `.pdf-item { 
      border: 2px solid #eee; 
      border-radius: 8px; 
      padding: 1rem; 
      cursor: pointer; 
      transition: all 0.2s; 
      position: relative;
      background: #fff;
      text-align: center;
    }`,
    `.pdf-item:hover { border-color: #007bff; box-shadow: 0 2px 8px rgba(0,123,255,0.2); }`,
    `.pdf-item.selected { border-color: #28a745; background: #f8fff8; }`,
    `.pdf-icon { font-size: 2rem; margin-bottom: 0.5rem; }`,
    `.pdf-name { font-weight: 600; margin-bottom: 0.25rem; color: #333; }`,
    `.pdf-date { font-size: 0.8rem; color: #666; margin-bottom: 0.5rem; }`,
    `.selected-indicator { 
      position: absolute; 
      top: 8px; 
      right: 8px; 
      background: #28a745; 
      color: white; 
      border-radius: 50%; 
      width: 20px; 
      height: 20px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 12px; 
    }`
  ]
})
export class VolunteersComponent implements OnDestroy, OnInit {
  hasAccess = false;
  permissionsLoaded = false;
  sub: Subscription;

  textVolunteer: any = {
    textContent: '',
    imageUrl: '',
    flyerPdfUrl: ''
  };
  loading = false;
  showLibrary = false;
  showPdfLibrary = false;
  pictosList: any[] = [];
  pdfDocumentsList: PdfDocument[] = [];
  selectedPictoId: number | null = null;
  apiUrl = environment.apiUrl;
  selectedFlyerPdfFile: File | null = null;
  selectedPdfFile: File | null = null;
  newPdfName = '';

  constructor(
    private permissions: PermissionsService,
    private http: HttpClient,
    private pictosService: PictosService,
    private uploadService: UploadHttpService,
    private pdfService: PdfDocumentsService
  ) {
    this.sub = this.permissions.getPermissions().subscribe(perms => {
      this.hasAccess = perms.some(p => p.resource === 'volunteers');
      this.permissionsLoaded = true;
    });
  }

  ngOnInit() {
    this.loadTextVolunteer();
    this.loadPdfDocuments(); // Charger les PDFs au démarrage
  }

  loadTextVolunteer() {
    this.http.get<any[]>(`${environment.apiUrl}/text-volunteers`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.textVolunteer = data[0];
          console.log('Text volunteer loaded:', this.textVolunteer); // Debug log
        } else {
          // Si aucun contenu n'existe, on en crée un par défaut
          this.textVolunteer = {
            textContent: '<p class="lead">Rejoindre Nouvoulook en tant que bénévole, c\'est s\'engager dans une aventure humaine et solidaire, développer de nouvelles compétences et partager des moments forts avec une équipe dynamique.</p><ul class="list-unstyled mt-4"><li class="mb-3 d-flex align-items-center"><span class="me-3 fs-3" style="color:#fc4811;"><i class="bi bi-people-fill"></i></span><span>Participer à un projet social et solidaire</span></li><li class="mb-3 d-flex align-items-center"><span class="me-3 fs-3" style="color:#e09c2b;"><i class="bi bi-lightbulb-fill"></i></span><span>Acquérir de nouvelles compétences</span></li><li class="mb-3 d-flex align-items-center"><span class="me-3 fs-3" style="color:#e23e57;"><i class="bi bi-chat-dots-fill"></i></span><span>Rencontrer et échanger avec des personnes inspirantes</span></li><li class="mb-3 d-flex align-items-center"><span class="me-3 fs-3" style="color:#d72660;"><i class="bi"></i></span><span>Avoir un impact positif sur la communauté</span></li></ul>',
            imageUrl: '/assets/benevolat.jpg'
          };
          // On crée automatiquement le contenu par défaut
          this.onSubmit();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du contenu:', error);
        this.textVolunteer = { textContent: '', imageUrl: '' };
      }
    });
  }

  async onSubmit() {
    this.loading = true;
    try {
      // Si un nouveau PDF a été sélectionné, on l'upload d'abord
      if (this.selectedFlyerPdfFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFlyerPdfFile);
        const res: any = await this.http.post(`${this.apiUrl}/text-volunteers/upload-flyer`, formData).toPromise();
        this.textVolunteer.flyerPdfUrl = res.url || res.path || res.fileUrl;
        this.selectedFlyerPdfFile = null;
      }
    const url = this.textVolunteer.id 
        ? `${this.apiUrl}/text-volunteers/${this.textVolunteer.id}`
        : `${this.apiUrl}/text-volunteers`;
    const method = this.textVolunteer.id ? 'patch' : 'post';
    // On ne garde que les champs nécessaires
    const data = {
      textContent: this.textVolunteer.textContent.replace(/(?:\r\n|\r|\n)/g, '<br>'),
        imageUrl: this.textVolunteer.imageUrl,
        flyerPdfUrl: this.textVolunteer.flyerPdfUrl
    };
    this.http[method](url, data).subscribe({
      next: (response) => {
        this.textVolunteer = response;
        this.loading = false;
        alert('Les modifications ont été mises à jour avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du contenu:', error);
        this.loading = false;
        alert('Erreur lors de la mise à jour du contenu');
      }
    });
    } catch (error) {
      this.loading = false;
      alert('Erreur lors de l\'upload du PDF');
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
    this.textVolunteer.imageUrl = picto.url;
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
      if (this.textVolunteer.flyerPdfUrl) {
        this.http.delete(`${this.apiUrl}/text-volunteers/delete-flyer`, { body: { url: this.textVolunteer.flyerPdfUrl } }).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.textVolunteer.flyerPdfUrl = '';
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
        this.textVolunteer.flyerPdfUrl = '';
        this.selectedFlyerPdfFile = null;
      }
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  
  onTextContentChange(value: string) {
    const spanHtml = this.convertParagraphsToSpans(value);
    this.textVolunteer.textContent = spanHtml;
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

  // Méthodes pour la bibliothèque PDF
  openPdfLibrary() {
    this.showPdfLibrary = true;
    this.loadPdfDocuments();
  }

  closePdfLibrary() {
    this.showPdfLibrary = false;
    this.selectedPdfFile = null;
    this.newPdfName = '';
  }

  loadPdfDocuments() {
    this.pdfService.getPdfDocuments().subscribe({
      next: (pdfs) => {
        this.pdfDocumentsList = pdfs;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des PDFs:', error);
      }
    });
  }

  onPdfFileSelected(event: any) {
    this.selectedPdfFile = event.target.files[0];
  }

  uploadPdf() {
    if (!this.selectedPdfFile || !this.newPdfName) return;

    this.pdfService.uploadPdf(this.selectedPdfFile, this.newPdfName).then((pdf: PdfDocument) => {
      this.pdfDocumentsList.push(pdf);
      this.selectedPdfFile = null;
      this.newPdfName = '';
      alert('PDF uploadé avec succès !');
    }).catch((error: any) => {
      console.error('Erreur upload PDF:', error);
      alert('Erreur lors de l\'upload du PDF');
    });
  }

  selectPdfFromLibrary(pdf: PdfDocument) {
    this.textVolunteer.flyerPdfUrl = pdf.url;
    this.closePdfLibrary();
    // Sauvegarder automatiquement après la sélection
    this.onSubmit();
    alert(`PDF "${pdf.name}" sélectionné et sauvegardé !`);
  }

  removePdf(pdf: PdfDocument) {
    if (confirm(`Voulez-vous vraiment supprimer "${pdf.name}" ?`)) {
      this.pdfService.deletePdf(pdf.id).subscribe({
        next: () => {
          this.pdfDocumentsList = this.pdfDocumentsList.filter(p => p.id !== pdf.id);
          if (this.textVolunteer.flyerPdfUrl === pdf.url) {
            this.textVolunteer.flyerPdfUrl = '';
          }
          alert('PDF supprimé avec succès !');
        },
        error: (error: any) => {
          console.error('Erreur suppression PDF:', error);
          alert('Erreur lors de la suppression du PDF');
        }
      });
    }
  }

  getPdfName(url: string): string {
    const pdf = this.pdfDocumentsList.find(p => p.url === url);
    return pdf ? pdf.name : 'PDF inconnu';
  }
} 