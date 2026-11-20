import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL } from './api.config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { CurrentUserService } from './current-user.service';

function fakeToken(expiresInSeconds: number): string {
  const payload = btoa(JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + expiresInSeconds }));
  return `header.${payload}.signature`;
}

describe('AuthService and authInterceptor', () => {
  let http: HttpTestingController;

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  };

  beforeEach(() => localStorage.clear());

  it('is logged out at the start', () => {
    setup();
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(false);
  });

  it('ignores an expired token that was saved earlier', () => {
    localStorage.setItem('dreamsaver.token', fakeToken(-60));
    setup();
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(false);
  });

  it('login stores the token, loads the user and sends the token on later calls', () => {
    setup();
    const auth = TestBed.inject(AuthService);
    const token = fakeToken(3600);
    let name = '';

    auth.login('roman@example.com', 'supersecret123').subscribe((user) => (name = user.name));

    const loginRequest = http.expectOne(`${API_URL}/auth/login`);
    expect(loginRequest.request.body).toEqual({ email: 'roman@example.com', password: 'supersecret123' });
    loginRequest.flush({ token });

    const meRequest = http.expectOne(`${API_URL}/auth/me`);
    expect(meRequest.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    meRequest.flush({ _id: 'u1', name: 'Roman', email: 'roman@example.com' });

    expect(name).toBe('Roman');
    expect(auth.isLoggedIn()).toBe(true);
    expect(TestBed.inject(CurrentUserService).userId()).toBe('u1');
  });

  it('does not send the token to other websites', () => {
    localStorage.setItem('dreamsaver.token', fakeToken(3600));
    setup();
    TestBed.inject(HttpClient).get('https://example.com/data').subscribe();

    expect(http.expectOne('https://example.com/data').request.headers.has('Authorization')).toBe(false);
  });

  it('logs the user out when the server answers 401', () => {
    localStorage.setItem('dreamsaver.token', fakeToken(3600));
    setup();
    const auth = TestBed.inject(AuthService);
    expect(auth.isLoggedIn()).toBe(true);

    auth.register({ name: 'a', email: 'a@b.c', password: 'password1' }).subscribe({ error: () => undefined });
    http.expectOne(`${API_URL}/auth/register`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('dreamsaver.token')).toBeNull();
  });
});