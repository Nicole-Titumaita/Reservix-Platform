import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios.service';
import { environment } from '../../../environments/environment';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuariosService]
    });
    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET all users', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should POST create user', () => {
    service.create({ nombre: 'Juan' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre: 'Juan' });
    req.flush({ success: true, data: { id: 1 } });
  });
});
