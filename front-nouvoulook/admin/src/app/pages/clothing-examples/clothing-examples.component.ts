import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clothing-examples',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <h2>Gestion des exemples de donations</h2>
      <button class="btn btn-success mb-3" (click)="openAddModal()">Ajouter un exemple de donation</button>
      <table class="table table-striped" *ngIf="clothingExamples.length">
        <thead>
          <tr>
            <th>Image</th>
            <th>Description</th>
            <th>Accepté</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of clothingExamples">
            <td><img [src]="item.imageUrl" alt="" style="max-width:60px;max-height:60px;"></td>
            <td>{{ item.description }}</td>
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
      <div *ngIf="!clothingExamples.length && !loading">Aucun exemple trouvée.</div>
      <div *ngIf="loading">Chargement...</div>

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
                  <label>Image (URL)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentItem.imageUrl" name="imageUrl" required />
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
  `,
  styles: [`
    .modal { background: rgba(0,0,0,0.2); }
    .modal-dialog { margin-top: 10vh; }
  `]
})
export class ClothingExamplesComponent implements OnInit {
  clothingExamples: any[] = [];
  loading = false;
  showModal = false;
  editMode = false;
  currentItem: any = { imageUrl: '', description: '', accepted: false };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadClothingExamples();
  }

  loadClothingExamples() {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/clothing-examples`).subscribe({
      next: (data: any) => {
        this.clothingExamples = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openAddModal() {
    this.editMode = false;
    this.currentItem = { imageUrl: '', description: '', accepted: false };
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
    if (confirm('Supprimer cet exemple ?')) {
      this.http.delete(`${environment.apiUrl}/clothing-examples/${item.id}`).subscribe(() => {
        this.loadClothingExamples();
      });
    }
  }

  toggleAccepted(item: any) {
    this.http.patch(`${environment.apiUrl}/clothing-examples/${item.id}`, { accepted: item.accepted }).subscribe();
  }
} 