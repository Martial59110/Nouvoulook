import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PictosService {
  private apiUrl = `${environment.apiUrl}/pictos`;

  constructor(private http: HttpClient) {}

  getPictos() {
    return this.http.get<any[]>(this.apiUrl);
  }

  uploadPicto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  deletePicto(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 