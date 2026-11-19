import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { CreateDreamDto, Dream, DreamEstimate, UpdateDreamDto } from '../models/dream.model';

@Injectable({ providedIn: 'root' })
export class DreamService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/dreams`;

  getDreams(userId: string): Observable<Dream[]> {
    return this.http.get<Dream[]>(this.apiUrl, { params: new HttpParams().set('userId', userId) });
  }

  getDreamById(id: string): Observable<Dream> {
    return this.http.get<Dream>(`${this.apiUrl}/${id}`);
  }

  getEstimate(id: string): Observable<DreamEstimate> {
    return this.http.get<DreamEstimate>(`${this.apiUrl}/${id}/estimate`);
  }

  addDream(dream: CreateDreamDto): Observable<Dream> {
    return this.http.post<Dream>(this.apiUrl, dream);
  }

  updateDream(id: string, changes: UpdateDreamDto): Observable<Dream> {
    return this.http.put<Dream>(`${this.apiUrl}/${id}`, changes);
  }

  deleteDream(id: string): Observable<Dream> {
    return this.http.delete<Dream>(`${this.apiUrl}/${id}`);
  }
}
