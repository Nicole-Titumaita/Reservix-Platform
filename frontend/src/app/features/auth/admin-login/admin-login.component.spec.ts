import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminLoginComponent } from './admin-login.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('AdminLoginComponent', () => {
  let fixture: ComponentFixture<AdminLoginComponent>;
  let component: AdminLoginComponent;
  const authSpy = jasmine.createSpyObj('AuthService', ['adminLogin', 'verifyTwoFactor', 'resendTwoFactor', 'saveSession']);
  const notificationsSpy = jasmine.createSpyObj('NotificationService', ['error', 'show']);

  beforeEach(async () => {
    authSpy.adminLogin.and.returnValue(of({ success: true, data: { requires_2fa: true, user_id: 1, delivery_channel: 'console' } }));
    authSpy.verifyTwoFactor.and.returnValue(of({ success: true, data: { token: 'jwt', usuario: { id: 1, rol_id: 1, rol_nombre: 'ADMINISTRADOR' } } }));
    authSpy.resendTwoFactor.and.returnValue(of({ success: true, data: { requires_2fa: true, user_id: 1 } }));

    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders admin login form', () => {
    expect(fixture.nativeElement.textContent).toContain('Ingresar como administrador');
  });

  it('enters otp step after admin login', () => {
    component.form.setValue({ email: 'admin@demo.local', password: 'Seguro123*' });
    component.submit();
    expect(component.otpStep).toBeTrue();
    expect(authSpy.adminLogin).toHaveBeenCalled();
  });
});
