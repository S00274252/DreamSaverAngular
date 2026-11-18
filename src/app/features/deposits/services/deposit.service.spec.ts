import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { errorInterceptor } from '../../../core/error.interceptor';
import { DepositService } from './deposit.service';

describe('DepositService', () => {
  let service: DepositService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(DepositService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets only the deposits of one user using the userId filter', () => {
    service.getDeposits('abc123').subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/deposits') && r.params.get('userId') === 'abc123');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('posts a new deposit', () => {
    const dto = { userId: 'abc123', amount: 250, date: '2026-01-31' };
    service.addDeposit(dto).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/deposits'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ _id: '1', ...dto });
  });

  it('puts changes to one deposit and deletes it', () => {
    service.updateDeposit('1', { amount: 175, date: '2026-01-31', note: '' }).subscribe();
    const put = http.expectOne((r) => r.url.endsWith('/deposits/1'));
    expect(put.request.method).toBe('PUT');
    put.flush({});

    service.deleteDeposit('1').subscribe();
    const del = http.expectOne((r) => r.url.endsWith('/deposits/1'));
    expect(del.request.method).toBe('DELETE');
    del.flush({});
  });

  it('turns a 404 into a friendly error message', () => {
    let message = '';
    service.getDepositById('missing').subscribe({ error: (e: Error) => (message = e.message) });
    http.expectOne((r) => r.url.endsWith('/deposits/missing')).flush({}, { status: 404, statusText: 'Not Found' });
    expect(message).toBe('The item you asked for could not be found.');
  });
});
