import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  const authSpy = jasmine.createSpyObj('AuthService', ['register', 'requestInstitutionalCode']);
  const notificationsSpy = jasmine.createSpyObj('NotificationService', ['error', 'show']);

  beforeEach(async () => {
    authSpy.register.and.returnValue(of({ success: true, data: { id: 1 } }));
    authSpy.requestInstitutionalCode.and.returnValue(of({ success: true, message: 'Codigo enviado al correo' }));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('defaults to estudiante role', () => {
    expect(component.form.get('rol_id')?.value).toBe('3');
  });

  it('requests institutional code when email and role are valid', () => {
    component.form.patchValue({
      email: 'demo@demo.local',
      rol_id: '3'
    });
    component.requestInstitutionalCode();
    expect(authSpy.requestInstitutionalCode).toHaveBeenCalled();
    expect(component.codeMessage).toContain('Codigo enviado');
  });
});
