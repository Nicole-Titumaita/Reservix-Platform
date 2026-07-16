import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RolesService } from './roles.service';
import { environment } from '../../../environments/environment';

describe('RolesService', () => {
  let service: RolesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RolesService]
    });
    service = TestBed.inject(RolesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET roles', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
