import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PdfDocument {
  id: number;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfDocumentsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPdfDocuments(): Observable<PdfDocument[]> {
    return this.http.get<PdfDocument[]>(`${this.apiUrl}/pdf-documents`);
  }

  uploadPdf(file: File, name: string): Promise<PdfDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    console.log('Token for PDF upload:', token ? 'Present' : 'Missing');
    
    return fetch(`${this.apiUrl}/pdf-documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    });
  }

  deletePdf(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pdf-documents/${id}`);
  }
} 