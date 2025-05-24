import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PermissionsService } from './permissions.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth/login';

  constructor(private http: HttpClient, private permissions: PermissionsService) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { email, password });
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false, user: any = null) {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    
    storage.setItem('access_token', accessToken);
    storage.setItem('refresh_token', refreshToken);
    
    if (user) {
      const decodedToken = this.decodeJwt(accessToken);
      
      if (decodedToken && decodedToken.roles && Array.isArray(decodedToken.roles) && decodedToken.roles.length > 0) {
        user.role = decodedToken.roles[0];
      } else {
        user.role = 'user';
      }
      
      storage.setItem('user', JSON.stringify(user));
    }
    
    otherStorage.removeItem('access_token');
    otherStorage.removeItem('refresh_token');
    otherStorage.removeItem('user');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  getUser(): any {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout() {
    if (this.permissions) this.permissions.clear();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  }

  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response: any = await fetch(`${environment.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.access_token) {
        // On ne touche pas au refresh_token, il reste le même
        this.setTokens(data.access_token, refreshToken, false, this.getUser());
        return data.access_token;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  forgotPassword(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }
} 