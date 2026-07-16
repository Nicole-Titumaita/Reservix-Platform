import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EspaciosService } from './espacios.service';
import { environment } from '../../../environments/environment';

describe('EspaciosService', () => {
  let service: EspaciosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EspaciosService]
    });
    service = TestBed.inject(EspaciosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET espacios', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/espacios`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
