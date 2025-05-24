import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private permissions$ = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {}

  loadPermissionsForRole(role: string) {
    if (role === 'admin') {
      // Donne tous les droits à l'admin côté front
      const allResources = ['users', 'news', 'partners', 'donations', 'volunteers', 'contact', 'history', 'boutique'];
      const allActions = ['create', 'read', 'update', 'delete'];
      const perms = [];
      for (const resource of allResources) {
        for (const action of allActions) {
          perms.push({ role: 'admin', resource, action });
        }
      }
      this.permissions$.next(perms);
      return;
    }
    this.http.get<any[]>(environment.apiUrl + '/permissions/role/' + role, {
      headers: {
        Authorization: 'Bearer ' + (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
      }
    }).subscribe({
      next: perms => this.permissions$.next(perms),
      error: err => {
        if (err.status === 403) {
          this.permissions$.next([]); // Pas de droits, on vide les permissions
        }
      }
    });
  }

  getPermissions(): Observable<any[]> {
    return this.permissions$.asObservable();
  }

  hasAccess(resource: string): boolean {
    const perms = this.permissions$.getValue();
    return perms.some(p => p.resource === resource);
  }

  clear() {
    this.permissions$.next([]);
  }
} 