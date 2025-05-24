import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PermissionsService } from '../../services/permissions.service';
import { PictosService } from '../../services/pictos.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
                  <textarea
                    id="textContent"
                    name="textContent"
                    class="form-control"
                    rows="5"
                    [(ngModel)]="textVolunteer.textContent"
                    required
                  ></textarea>
                  <div class="form-text">Ce texte sera affiché sur la page des bénévoles.</div>
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

                <div class="mb-3">
                  <label for="flyerPdf" class="form-label">Charte des bénévoles PDF (téléchargeable sur la page bénévolat)</label>
                  <div class="input-group">
                    <input type="file" id="flyerPdf" name="flyerPdf" class="form-control" accept="application/pdf" (change)="onFlyerPdfSelected($event)" [disabled]="!!textVolunteer.flyerPdfUrl" />
                    <button *ngIf="textVolunteer.flyerPdfUrl" type="button" class="btn btn-outline-danger" (click)="removeFlyerPdf()">Supprimer le PDF</button>
                  </div>
                  <div *ngIf="textVolunteer.flyerPdfUrl" class="mt-2">
                    <a [href]="apiUrl + textVolunteer.flyerPdfUrl" target="_blank" class="btn btn-link">Télécharger la charte actuelle</a>
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
    `.pictos-gallery img.selected { border: 2px solid #28a745; box-shadow: 0 0 8px #28a745; }`
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
  pictosList: any[] = [];
  selectedPictoId: number | null = null;
  apiUrl = environment.apiUrl;
  selectedFlyerPdfFile: File | null = null;

  constructor(
    private permissions: PermissionsService,
    private http: HttpClient,
    private pictosService: PictosService
  ) {
    this.sub = this.permissions.getPermissions().subscribe(perms => {
      this.hasAccess = perms.some(p => p.resource === 'volunteers');
      this.permissionsLoaded = true;
    });
  }

  ngOnInit() {
    this.loadTextVolunteer();
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
      this.pictosService.uploadPicto(file).subscribe(() => this.loadPictos());
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
} 