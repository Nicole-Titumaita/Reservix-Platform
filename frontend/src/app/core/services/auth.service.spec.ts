import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login posts to the correct endpoint', () => {
    service.login({ email: 'demo@demo.local', password: 'Seguro123*' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'demo@demo.local', password: 'Seguro123*' });
    req.flush({ success: true, data: { requires_2fa: true } });
  });

  it('request institutional code posts to the correct endpoint', () => {
    service.requestInstitutionalCode({ email: 'demo@demo.local', rol_id: 3 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/request-institutional-code`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'demo@demo.local', rol_id: 3 });
    req.flush({ success: true });
  });

  it('forgot password posts to the correct endpoint', () => {
    service.forgotPassword({ email: 'demo@demo.local' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'demo@demo.local' });
    req.flush({ success: true });
  });
});
