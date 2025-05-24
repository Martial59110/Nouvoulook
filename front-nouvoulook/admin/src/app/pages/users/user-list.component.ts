import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="isAdmin; else forbidden">
      <h2>Liste des utilisateurs</h2>
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-success" (click)="openAddModal()">Ajouter un utilisateur</button>
        <button class="btn btn-secondary" (click)="openPermissionsModal()">Gérer les permissions</button>
      </div>
      <table class="table table-striped" *ngIf="users.length">
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.firstname }}</td>
            <td>{{ user.lastname }}</td>
            <td>{{ user.email }}</td>
            <td>
              <ng-container *ngIf="user.roles && user.roles.length; else noRole">
                <span *ngFor="let r of user.roles; let last = last">
                  {{ getRoleLabel(r) }}<span *ngIf="!last">, </span>
                </span>
              </ng-container>
              <ng-template #noRole>-</ng-template>
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-2" (click)="openEditModal(user)">Modifier</button>
              <button class="btn btn-sm btn-danger" (click)="deleteUser(user)" [disabled]="user.id === currentUserId">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!users.length && !loading">Aucun utilisateur trouvé.</div>
      <div *ngIf="loading">Chargement...</div>

      <!-- Modal Ajouter -->
      <div class="modal fade" tabindex="-1" [ngClass]="{'show d-block': showAddModal}" *ngIf="showAddModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Ajouter un utilisateur</h5>
              <button type="button" class="btn-close" (click)="closeAddModal()"></button>
            </div>
            <div class="modal-body">
              <form #addForm="ngForm">
                <div class="mb-3">
                  <label>Prénom</label>
                  <input type="text" class="form-control" [(ngModel)]="addUser.firstname" name="firstname" required />
                </div>
                <div class="mb-3">
                  <label>Nom</label>
                  <input type="text" class="form-control" [(ngModel)]="addUser.lastname" name="lastname" required />
                </div>
                <div class="mb-3">
                  <label>Email</label>
                  <input type="email" class="form-control" [(ngModel)]="addUser.email" name="email" required autocomplete="off" />
                </div>
                <div class="mb-3">
                  <label>Mot de passe</label>
                  <input type="password" class="form-control" [(ngModel)]="addUser.password" name="password" required autocomplete="new-password" />
                </div>
                <div class="mb-3">
                  <label>Rôle</label>
                  <select class="form-select" [(ngModel)]="addUser.role" name="role" required>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeAddModal()">Annuler</button>
              <button type="button" class="btn btn-success" (click)="addUserSubmit()">Ajouter</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Modifier -->
      <div class="modal fade" tabindex="-1" [ngClass]="{'show d-block': showEditModal}" *ngIf="showEditModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Modifier le rôle</h5>
              <button type="button" class="btn-close" (click)="closeEditModal()"></button>
            </div>
            <div class="modal-body">
              <form #editForm="ngForm">
                <div class="mb-3">
                  <label>Rôle</label>
                  <select class="form-select" [(ngModel)]="editUser.role" name="editRole" required>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeEditModal()">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="editUserSubmit()">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Permissions -->
      <div class="modal fade" tabindex="-1" [ngClass]="{'show d-block': showPermissionsModal}" *ngIf="showPermissionsModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Gérer les accès par rôle</h5>
              <button type="button" class="btn-close" (click)="closePermissionsModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="permissionsLoading">Chargement...</div>
              <div *ngIf="!permissionsLoading">
                <table class="table table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Rôle</th>
                      <th *ngFor="let res of permissionResources">{{ res.label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let role of permissionRoles">
                      <td><b>{{ getRoleLabel(role) }}</b></td>
                      <td *ngFor="let res of permissionResources">
                        <input type="checkbox"
                          class="form-check-input"
                          [checked]="role === 'admin' ? true : hasAccess(role, res.key)"
                          (change)="toggleAccess(role, res.key)"
                          [disabled]="role === 'admin' || (role === 'user' && res.key === 'users')"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="alert alert-info mt-3">
                  <b>Notes :<br></b> - Le rôle <b>Utilisateur</b> n'aura jamais accès à la gestion des utilisateurs, même si vous essayez de cocher la case.<br>
                  - L'accès donne tous les droits sur la page correspondante.
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closePermissionsModal()">Fermer</button>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
    <ng-template #forbidden>
      <div class="alert alert-danger mt-4">
        Accès interdit : seuls les administrateurs peuvent gérer les utilisateurs.
        <div *ngIf="debugInfo" class="mt-2 small">
          <p>Rôle actuel : {{ userRole }}</p>
          <p>ID utilisateur : {{ currentUserId }}</p>
        </div>
      </div>
    </ng-template>
  `
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  loading = false;

  showAddModal = false;
  showEditModal = false;
  addUser: any = { firstname: '', lastname: '', email: '', password: '', role: 'user' };
  editUser: any = { id: '', role: 'user' };

  currentUserId: string = '';
  isAdmin: boolean = false;
  userRole: string = '';
  debugInfo: boolean = true;

  permissions: any[] = [];
  showPermissionsModal = false;
  permissionsLoading = false;
  permissionRoles = ['admin', 'user'];
  permissionResources = [
    { key: 'users', label: 'Gérer utilisateurs' },
    { key: 'news', label: 'Actualités' },
    { key: 'partners', label: 'Partenaires' },
    { key: 'donations', label: 'Page des dons' },
    { key: 'volunteers', label: 'Page des bénévoles' },
    { key: 'contact', label: 'Contact' },
    { key: 'history', label: 'Histoire' },
    { key: 'boutique', label: 'Boutique' },
  ];

  constructor(private http: HttpClient, private permissionsService: PermissionsService) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    this.currentUserId = user?.id;
    this.userRole = user?.role;
    this.isAdmin = user?.role === 'admin';
    
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.http.get<any[]>(environment.apiUrl + '/users').subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.users = [];
      }
    });
  }

  // Ajouter
  openAddModal() {
    this.addUser = { firstname: '', lastname: '', email: '', password: '', role: 'user' };
    this.showAddModal = true;
  }
  closeAddModal() { this.showAddModal = false; }
  addUserSubmit() {
    const userToSend = {
      firstname: this.addUser.firstname,
      lastname: this.addUser.lastname,
      email: this.addUser.email,
      password: this.addUser.password,
      roles: [this.addUser.role]
    };
    this.http.post(environment.apiUrl + '/auth/register', userToSend).subscribe({
      next: () => {
        this.fetchUsers();
        this.closeAddModal();
      },
      error: () => { alert('Erreur lors de l\'ajout'); }
    });
  }

  // Modifier
  openEditModal(user: any) {
    this.editUser = { 
      id: user.id, 
      role: Array.isArray(user.roles) ? user.roles[0] : user.role || 'user' 
    };
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }
  editUserSubmit() {
    const isSelfEdit = this.editUser.id === this.currentUserId;
    const isAdminToUser = this.userRole === 'admin' && this.editUser.role === 'user' && isSelfEdit;
    // Vérifier s'il reste d'autres admins
    const otherAdmins = this.users.filter(u =>
      u.id !== this.currentUserId &&
      Array.isArray(u.roles) &&
      u.roles.includes('admin')
    );
    if (isAdminToUser && otherAdmins.length === 0) {
      alert('Impossible de changer votre rôle : vous êtes le dernier administrateur du système.');
      return;
    }
    const userToPatch = { roles: [this.editUser.role] };
    this.http.patch(environment.apiUrl + '/users/' + this.editUser.id, userToPatch).subscribe({
      next: () => {
        this.closeEditModal();
        this.fetchUsers();
        if (isSelfEdit) {
          alert('Votre rôle a été modifié. Vous allez être déconnecté et devez vous reconnecter pour que le changement soit pris en compte.');
          setTimeout(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user');
            window.location.href = '/';
          }, 500);
        } else {
          alert('Rôle modifié. Si la modification concerne votre propre compte, reconnectez-vous pour que le changement soit effectif.');
        }
      },
      error: () => { alert('Erreur lors de la modification'); }
    });
  }

  // Supprimer
  deleteUser(user: any) {
    if (user.id === this.currentUserId) {
      alert('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    if (confirm('Supprimer cet utilisateur ?')) {
      this.http.delete(environment.apiUrl + '/users/' + user.id).subscribe({
        next: () => this.fetchUsers(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      case 'partner': return 'Partenaire';
      case 'volunteer': return 'Bénévole';
      default: return role;
    }
  }

  openPermissionsModal() {
    this.showPermissionsModal = true;
    this.loadPermissions();
  }
  closePermissionsModal() { this.showPermissionsModal = false; }

  loadPermissions() {
    this.permissionsLoading = true;
    this.http.get<any[]>(environment.apiUrl + '/permissions').subscribe({
      next: (data) => {
        this.permissions = data;
        this.permissionsLoading = false;
      },
      error: () => {
        this.permissions = [];
        this.permissionsLoading = false;
      }
    });
  }

  hasAccess(role: string, resource: string): boolean {
    return this.permissions.some(p => p.role === role && p.resource === resource);
  }

  toggleAccess(role: string, resource: string) {
    // Interdire la gestion des utilisateurs pour le rôle 'user'
    if (role === 'user' && resource === 'users') return;
    // Interdire toute modification pour admin
    if (role === 'admin') return;
    const actions = ['create', 'read', 'update', 'delete'];
    const has = this.hasAccess(role, resource);
    if (has) {
      // Supprimer toutes les permissions CRUD pour ce rôle/ressource
      const perms = this.permissions.filter(p => p.role === role && p.resource === resource);
      let done = 0;
      perms.forEach(perm => {
        this.http.delete(environment.apiUrl + '/permissions/' + perm.id).subscribe(() => {
          done++;
          if (done === perms.length) {
            this.loadPermissions();
            // Si on modifie le rôle courant, recharger les permissions du dashboard après un court délai
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            if (user && user.role === role && this.permissionsService) {
              setTimeout(() => this.permissionsService.loadPermissionsForRole(role), 200);
            }
          }
        });
      });
    } else {
      // Ajouter toutes les permissions CRUD pour ce rôle/ressource
      let done = 0;
      actions.forEach(action => {
        this.http.post(environment.apiUrl + '/permissions', { role, resource, action }).subscribe(() => {
          done++;
          if (done === actions.length) {
            this.loadPermissions();
            // Si on modifie le rôle courant, recharger les permissions du dashboard après un court délai
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            if (user && user.role === role && this.permissionsService) {
              setTimeout(() => this.permissionsService.loadPermissionsForRole(role), 200);
            }
          }
        });
      });
    }
  }
} 