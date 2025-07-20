import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PictosService } from '../../services/pictos.service';
import { UploadHttpService } from '../../services/upload-http.service';
import { PdfDocumentsService, PdfDocument } from '../../services/pdf-documents.service';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  template: `
    <div class="container-fluid">
      <h2>Gestion de la page dons</h2>
      
      <div class="card mt-4">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #donationForm="ngForm">
            <div class="mb-3">
              <label for="messageSchedule" class="form-label">Horaires d'ouverture pour les dons</label>
              <app-rich-text-editor
                [value]="convertSpansToParagraphs(textDonation.messageSchedule)"
                (valueChange)="onMessageScheduleChange($event)"
              ></app-rich-text-editor>
              <div class="form-text">Exemple : Nouvoulook vous accueille du mardi au vendredi matin de 9h à 12h ! Ainsi que le samedi après midi de 14h à 18h. Utilisez les outils de formatage ci-dessus pour mettre en forme votre texte.</div>
            </div>

            <div class="mb-3">
              <label for="messageAdvertising" class="form-label">Concernant les dons</label>
              <app-rich-text-editor
                [value]="convertSpansToParagraphs(textDonation.messageAdvertising)"
                (valueChange)="onMessageAdvertisingChange($event)"
              ></app-rich-text-editor>
              <div class="form-text">Ce message sera affiché sur la page des dons. Utilisez les outils de formatage ci-dessus pour mettre en forme votre texte.</div>
            </div>

            <div class="mb-3">
              <label for="imageUrl" class="form-label">Image (URL)</label>
              <div class="input-group">
                <input type="text" id="imageUrl" name="imageUrl" class="form-control" [(ngModel)]="textDonation.imageUrl" />
                <button type="button" class="btn btn-outline-secondary" (click)="openLibraryForTextDonation()">Ouvrir la bibliothèque</button>
              </div>
              <div *ngIf="textDonation.imageUrl" class="mt-2">
                <img [src]="apiUrl + textDonation.imageUrl" alt="Aperçu" style="max-width: 100px; max-height: 100px;" />
              </div>
            </div>

            <!-- Bibliothèque PDF -->
            <div class="card mt-4">
              <div class="card-body">
                <h5 class="card-title">Bibliothèque PDF</h5>
                <div class="mb-3">
                  <label class="form-label">PDF sélectionné pour la page dons</label>
                  <div class="input-group">
                    <input type="text" class="form-control" [value]="textDonation.flyerPdfUrl ? getPdfName(textDonation.flyerPdfUrl) : 'Aucun PDF sélectionné'" readonly />
                    <button type="button" class="btn btn-outline-secondary" (click)="openPdfLibrary()">Ouvrir la bibliothèque</button>
                    <button *ngIf="textDonation.flyerPdfUrl" type="button" class="btn btn-outline-danger" (click)="removeFlyerPdf()">Supprimer</button>
                  </div>
                  <div *ngIf="textDonation.flyerPdfUrl" class="mt-2">
                    <div class="alert alert-success">
                      <strong>PDF sélectionné :</strong> {{ getPdfName(textDonation.flyerPdfUrl) }}
                      <br>
                      <a [href]="apiUrl + textDonation.flyerPdfUrl" target="_blank" class="btn btn-sm btn-outline-primary mt-1">
                        <i class="bi bi-download me-1"></i>Télécharger
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="!donationForm.form.valid || loading">
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </form>
        </div>
      </div>
    </div>
    <!-- Début gestion des collectes -->
    <div class="container-fluid mt-5">
      <h2>Gestion des exemples de donations</h2>
      <button class="btn btn-success mb-3" (click)="openAddModal()">Ajouter un exemple de donation</button>
      <table class="table table-striped" *ngIf="clothingExamples.length">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
            <th>Accepté</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of clothingExamples">
            <td *ngIf="item.imageUrl">
              <img [src]="apiUrl + item.imageUrl" alt="Image collecte" style="width:48px; height:48px;">
            </td>
            <td>{{ item.name }}</td>
            <td>
              <input type="checkbox" [(ngModel)]="item.accepted" (change)="toggleAccepted(item)" />
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-2" (click)="openEditModal(item)">Modifier</button>
              <button class="btn btn-sm btn-danger" (click)="deleteClothingExample(item)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!clothingExamples.length && !loadingCollectes">Aucun exemples trouvée.</div>
      <div *ngIf="loadingCollectes">Chargement...</div>

      <!-- Modal Ajouter/Modifier -->
      <div class="modal fade" tabindex="-1" [ngClass]="{'show d-block': showModal}" *ngIf="showModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editMode ? 'Modifier' : 'Ajouter' }} un exemple</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form #form="ngForm">
                <div class="mb-3">
                  <label>Nom (interne)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentItem.name" name="name" required />
                  <div class="form-text">Ce nom n'est pas affiché sur le site public.</div>
                </div>
                <div class="mb-3">
                  <label>Image (URL)</label>
                  <div class="input-group">
                    <input type="text" class="form-control" [(ngModel)]="currentItem.imageUrl" name="imageUrl" />
                    <button type="button" class="btn btn-outline-secondary" (click)="openLibrary()">Ouvrir la bibliothèque</button>
                  </div>
                </div>
                <div class="mb-3">
                  <label>Description</label>
                  <textarea class="form-control" [(ngModel)]="currentItem.description" name="description" required></textarea>
                </div>
                <div class="mb-3">
                  <label>
                    <input type="checkbox" [(ngModel)]="currentItem.accepted" name="accepted" /> Accepté
                  </label>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="button" class="btn btn-success" (click)="saveClothingExample()">{{ editMode ? 'Enregistrer' : 'Ajouter' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Fin gestion des collectes -->

    <!-- Modale bibliothèque d'images -->
    <div class="modal" tabindex="-1" [ngStyle]="{display: showLibrary ? 'block' : 'none'}">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Bibliothèque d'images</h5>
            <button type="button" class="btn-close" (click)="closeLibrary()"></button>
          </div>
          <div class="modal-body">
            <!-- Message d'aide -->
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
                  [class.selected]="currentItem.imageUrl === picto.url"
                  [class.clickable]="true"
                  style="width:48px; height:48px; border:2px solid #eee; cursor:pointer; transition: box-shadow 0.2s, border 0.2s;">
                <span *ngIf="currentItem.imageUrl === picto.url"
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
                   [class.selected]="textDonation.flyerPdfUrl === pdf.url">
                <div class="pdf-icon">📄</div>
                <div class="pdf-name">{{ pdf.name }}</div>
                <div class="pdf-date">{{ pdf.createdAt | date:'dd/MM/yyyy' }}</div>
                <button (click)="removePdf(pdf); $event.stopPropagation()" class="btn btn-sm btn-outline-danger">🗑️</button>
                <span *ngIf="textDonation.flyerPdfUrl === pdf.url" class="selected-indicator">✔</span>
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
    `textarea { white-space: pre-wrap; }`,
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
export class DonationsComponent implements OnInit {
  textDonation: any = {
    messageSchedule: '',
    messageAdvertising: '',
    imageUrl: '',
    flyerPdfUrl: ''
  };
  loading = false;

  // Pour la gestion des collectes
  clothingExamples: any[] = [];
  loadingCollectes = false;
  showModal = false;
  editMode = false;
  currentItem: any = { name: '', imageUrl: '', description: '', accepted: false };

  showLibrary = false;
  showPdfLibrary = false;
  pictosList: any[] = [];
  pdfDocumentsList: PdfDocument[] = [];
  selectedPictoId: number | null = null;

  apiUrl = environment.apiUrl;

  libraryTarget: 'clothingExample' | 'textDonation' = 'clothingExample';

  // Ajout d'une variable temporaire pour le fichier PDF sélectionné
  selectedFlyerPdfFile: File | null = null;
  selectedPdfFile: File | null = null;
  newPdfName = '';

  constructor(private http: HttpClient, private pictosService: PictosService, private uploadService: UploadHttpService, private pdfService: PdfDocumentsService) {}

  ngOnInit() {
    this.loadTextDonation();
    this.loadClothingExamples();
    this.loadPdfDocuments(); // Charger les PDFs au démarrage
  }

  loadTextDonation() {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/text-donations`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.textDonation = data[0];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des horaires:', error);
        this.loading = false;
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
        const res: any = await this.http.post(`${this.apiUrl}/text-donations/upload-flyer`, formData).toPromise();
        this.textDonation.flyerPdfUrl = res.url || res.path || res.fileUrl;
        this.selectedFlyerPdfFile = null;
      }
    const url = this.textDonation.id 
        ? `${this.apiUrl}/text-donations/${this.textDonation.id}`
        : `${this.apiUrl}/text-donations`;
    const method = this.textDonation.id ? 'patch' : 'post';
    this.http[method](url, this.textDonation).subscribe({
      next: (response) => {
        this.textDonation = response;
        this.loading = false;
          alert('Les modifications ont été mises à jour avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour des horaires:', error);
        this.loading = false;
        alert('Erreur lors de la mise à jour des horaires');
      }
    });
    } catch (error) {
      this.loading = false;
      alert('Erreur lors de l\'upload du PDF');
    }
  }

  // Gestion clothing-examples
  loadClothingExamples() {
    this.loadingCollectes = true;
    this.http.get(`${environment.apiUrl}/clothing-examples`).subscribe({
      next: (data: any) => {
        this.clothingExamples = data;
        this.loadingCollectes = false;
      },
      error: () => { this.loadingCollectes = false; }
    });
  }

  openAddModal() {
    this.editMode = false;
    this.currentItem = { name: '', imageUrl: '', description: '', accepted: false };
    this.showModal = true;
  }

  openEditModal(item: any) {
    this.editMode = true;
    this.currentItem = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveClothingExample() {
    if (this.editMode) {
      this.http.patch(`${environment.apiUrl}/clothing-examples/${this.currentItem.id}`, this.currentItem).subscribe(() => {
        this.loadClothingExamples();
        this.closeModal();
      });
    } else {
      this.http.post(`${environment.apiUrl}/clothing-examples`, this.currentItem).subscribe(() => {
        this.loadClothingExamples();
        this.closeModal();
      });
    }
  }

  deleteClothingExample(item: any) {
    if (confirm('Supprimer cette collecte ?')) {
      this.http.delete(`${environment.apiUrl}/clothing-examples/${item.id}`).subscribe(() => {
        this.loadClothingExamples();
      });
    }
  }

  toggleAccepted(item: any) {
    this.http.patch(`${environment.apiUrl}/clothing-examples/${item.id}`, { accepted: item.accepted }).subscribe();
  }

  openLibrary() {
    this.libraryTarget = 'clothingExample';
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
    if (this.libraryTarget === 'textDonation') {
      this.textDonation.imageUrl = picto.url;
    } else {
      this.currentItem.imageUrl = picto.url;
    }
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

  openLibraryForTextDonation() {
    this.libraryTarget = 'textDonation';
    this.showLibrary = true;
    this.loadPictos();
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
    if (confirm('Supprimer le flyer PDF ?')) {
      if (this.textDonation.flyerPdfUrl) {
        this.http.delete(`${this.apiUrl}/text-donations/delete-flyer`, { body: { url: this.textDonation.flyerPdfUrl } }).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.textDonation.flyerPdfUrl = '';
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
        this.textDonation.flyerPdfUrl = '';
        this.selectedFlyerPdfFile = null;
      }
    }
  }

  onMessageAdvertisingChange(value: string) {
    const spanHtml = this.convertParagraphsToSpans(value);
    this.textDonation.messageAdvertising = spanHtml;
  }
  
  onMessageScheduleChange(value: string) {
    const spanHtml = this.convertParagraphsToSpans(value);
    this.textDonation.messageSchedule = spanHtml;
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
    this.textDonation.flyerPdfUrl = pdf.url;
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
          if (this.textDonation.flyerPdfUrl === pdf.url) {
            this.textDonation.flyerPdfUrl = '';
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