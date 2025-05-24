import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private http: HttpClient) {}

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/password`, {
      currentPassword,
      newPassword
    });
  }
} 