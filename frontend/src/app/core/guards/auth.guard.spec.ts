import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }]
    });
    localStorage.clear();
  });

  it('redirects to login without token', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('allows access with token', () => {
    localStorage.setItem('token', 'abc');
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });
});
