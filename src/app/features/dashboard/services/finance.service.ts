import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { Balance, Prediction } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/users`;

  getBalance(userId: string): Observable<Balance> {
    return this.http.get<Balance>(`${this.apiUrl}/${userId}/balance`);
  }

  getPrediction(userId: string, date: string, monthlyDeposit?: number): Observable<Prediction> {
    let params = new HttpParams().set('date', date);
    if (monthlyDeposit !== undefined) {
      params = params.set('monthlyDeposit', monthlyDeposit);
    }
    return this.http.get<Prediction>(`${this.apiUrl}/${userId}/prediction`, { params });
  }
}
