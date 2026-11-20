import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { CreateUserDto } from '../features/users/models/user.model';
import { API_URL } from './api.config';
import { CurrentUserService } from './current-user.service';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

const TOKEN_KEY = 'dreamsaver.token';

function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp !== 'number' || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly currentUser = inject(CurrentUserService);

  private readonly tokenState = signal<string | null>(this.readToken());

  readonly token = this.tokenState.asReadonly();
  readonly isLoggedIn = computed(() => this.tokenState() !== null);

  register(user: CreateUserDto): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${API_URL}/auth/register`, user);
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<{ token: string }>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap(({ token }) => this.storeToken(token)),
      switchMap(() => this.http.get<AuthUser>(`${API_URL}/auth/me`)),
      tap((user) => this.currentUser.select(user)),
    );
  }

  logout(): void {
    this.storeToken(null);
    this.currentUser.clear();
    this.router.navigate(['/login']);
  }

  private readToken(): string | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      return token && !isExpired(token) ? token : null;
    } catch {
      return null;
    }
  }

  private storeToken(token: string | null): void {
    this.tokenState.set(token);
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
    }
  }
}