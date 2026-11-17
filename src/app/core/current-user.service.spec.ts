import { TestBed } from '@angular/core/testing';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with no user', () => {
    const service = TestBed.inject(CurrentUserService);
    expect(service.userId()).toBeNull();
  });

  it('remembers the selected user and can clear it', () => {
    const service = TestBed.inject(CurrentUserService);
    service.select({ _id: 'u1', name: 'Roman' });
    expect(service.userId()).toBe('u1');
    expect(service.user()?.name).toBe('Roman');

    service.clear();
    expect(service.userId()).toBeNull();
  });

  it('ignores broken saved data', () => {
    localStorage.setItem('dreamsaver.currentUser', '{"nope":true}');
    const service = TestBed.inject(CurrentUserService);
    expect(service.userId()).toBeNull();
  });
});
