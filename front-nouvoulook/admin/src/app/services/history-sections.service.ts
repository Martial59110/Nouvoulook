import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HistorySection {
  id: string;
  order: number;
  imageUrl?: string;
  textContent?: string;
  historyId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistorySectionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  create(historyId: string, section: Partial<HistorySection>): Observable<HistorySection> {
    return this.http.post<HistorySection>(`${this.apiUrl}/history/${historyId}/sections`, section);
  }

  update(id: string, section: Partial<HistorySection>): Observable<HistorySection> {
    return this.http.patch<HistorySection>(`${this.apiUrl}/history/sections/${id}`, section);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/history/sections/${id}`);
  }

  reorder(historyId: string, sectionIds: string[]): Observable<HistorySection[]> {
    return this.http.post<HistorySection[]>(`${this.apiUrl}/history/${historyId}/sections/reorder`, { sectionIds });
  }
} 