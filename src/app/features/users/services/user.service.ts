import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { CreateUserDto, UpdateUserDto, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  addUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, changes: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, changes);
  }

  deleteUser(id: string): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`);
  }
}
