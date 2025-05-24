import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface News {
  id: string;
  title: string;
  textContent: string;
  imageUrl: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<News[]> {
    return this.http.get<News[]>(this.apiUrl);
  }

  create(news: Partial<News>): Observable<News> {
    return this.http.post<News>(this.apiUrl, news);
  }

  update(id: string, news: Partial<News>): Observable<News> {
    return this.http.patch<News>(`${this.apiUrl}/${id}`, news);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 