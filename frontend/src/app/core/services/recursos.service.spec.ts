import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecursosService } from './recursos.service';
import { environment } from '../../../environments/environment';

describe('RecursosService', () => {
  let service: RecursosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecursosService]
    });
    service = TestBed.inject(RecursosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET resources', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/recursos`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
