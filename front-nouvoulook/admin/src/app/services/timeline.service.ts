import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimelineItem {
  id: string;
  year: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TimelineItem[]> {
    return this.http.get<TimelineItem[]>(`${this.apiUrl}/timeline-item`);
  }

  getById(id: string): Observable<TimelineItem> {
    return this.http.get<TimelineItem>(`${this.apiUrl}/timeline-item/${id}`);
  }

  create(timelineItem: Partial<TimelineItem>): Observable<TimelineItem> {
    return this.http.post<TimelineItem>(`${this.apiUrl}/timeline-item`, timelineItem);
  }

  update(id: string, timelineItem: Partial<TimelineItem>): Observable<TimelineItem> {
    return this.http.patch<TimelineItem>(`${this.apiUrl}/timeline-item/${id}`, timelineItem);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/timeline-item/${id}`);
  }
} 