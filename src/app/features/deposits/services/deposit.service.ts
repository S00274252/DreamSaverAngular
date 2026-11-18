import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { CreateDepositDto, Deposit, UpdateDepositDto } from '../models/deposit.model';

@Injectable({ providedIn: 'root' })
export class DepositService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/deposits`;

  getDeposits(userId: string): Observable<Deposit[]> {
    return this.http.get<Deposit[]>(this.apiUrl, { params: new HttpParams().set('userId', userId) });
  }

  getDepositById(id: string): Observable<Deposit> {
    return this.http.get<Deposit>(`${this.apiUrl}/${id}`);
  }

  addDeposit(deposit: CreateDepositDto): Observable<Deposit> {
    return this.http.post<Deposit>(this.apiUrl, deposit);
  }

  updateDeposit(id: string, changes: UpdateDepositDto): Observable<Deposit> {
    return this.http.put<Deposit>(`${this.apiUrl}/${id}`, changes);
  }

  deleteDeposit(id: string): Observable<Deposit> {
    return this.http.delete<Deposit>(`${this.apiUrl}/${id}`);
  }
}
