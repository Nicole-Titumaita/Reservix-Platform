import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservasService } from './reservas.service';
import { environment } from '../../../environments/environment';

describe('ReservasService', () => {
  let service: ReservasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservasService]
    });
    service = TestBed.inject(ReservasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should request disponibilidad with query params', () => {
    service.checkDisponibilidad({ espacio_id: 1, fecha_inicio: '2026-01-01T10:00:00Z', fecha_fin: '2026-01-01T11:00:00Z' }).subscribe();
    const req = httpMock.expectOne((request) => request.url === `${environment.apiUrl}/reservas/disponibilidad`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('espacio_id')).toBe('1');
    req.flush({ success: true, data: { disponible: true } });
  });

  it('should approve reservations through PATCH', () => {
    service.aprobar(9, 'ok').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/9/aprobar`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ observacion: 'ok' });
    req.flush({ success: true, data: { id: 9 } });
  });
});
