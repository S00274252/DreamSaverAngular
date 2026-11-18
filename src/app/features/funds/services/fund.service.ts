import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { CreateFundDto, Fund, UpdateFundDto } from '../models/fund.model';

@Injectable({ providedIn: 'root' })
export class FundService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/funds`;

  getFunds(userId: string): Observable<Fund[]> {
    return this.http.get<Fund[]>(this.apiUrl, { params: new HttpParams().set('userId', userId) });
  }

  getFundById(id: string): Observable<Fund> {
    return this.http.get<Fund>(`${this.apiUrl}/${id}`);
  }

  addFund(fund: CreateFundDto): Observable<Fund> {
    return this.http.post<Fund>(this.apiUrl, fund);
  }

  updateFund(id: string, changes: UpdateFundDto): Observable<Fund> {
    return this.http.put<Fund>(`${this.apiUrl}/${id}`, changes);
  }

  deleteFund(id: string): Observable<Fund> {
    return this.http.delete<Fund>(`${this.apiUrl}/${id}`);
  }
}
