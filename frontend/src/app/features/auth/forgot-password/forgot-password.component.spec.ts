import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let component: ForgotPasswordComponent;
  const authSpy = jasmine.createSpyObj('AuthService', ['forgotPassword']);
  const notificationsSpy = jasmine.createSpyObj('NotificationService', ['error', 'show']);

  beforeEach(async () => {
    authSpy.forgotPassword.and.returnValue(of({ success: true, message: 'Si el correo pertenece a una cuenta registrada, recibirás un enlace para restablecer tu contraseña.' }));

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows generic success message after submit', () => {
    component.form.setValue({ email: 'demo@demo.local' });
    component.submit();
    expect(authSpy.forgotPassword).toHaveBeenCalled();
    expect(component.successMessage).toContain('Si el correo pertenece');
  });
});
