import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor(private http: HttpClient) {}

  recordPageView(path: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/statistics/pageview`, { path });
  }

  getTotalViews(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/statistics/total`);
  }

  getDailyViews(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/statistics/daily`);
  }

  getWeeklyViews(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/statistics/weekly`);
  }

  getMonthlyViews(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/statistics/monthly`);
  }

  getYearlyViews(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/statistics/yearly`);
  }
} 