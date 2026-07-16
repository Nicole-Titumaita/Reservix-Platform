import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  const authSpy = jasmine.createSpyObj('AuthService', ['login', 'verifyTwoFactor', 'resendTwoFactor', 'saveSession']);
  const notificationsSpy = jasmine.createSpyObj('NotificationService', ['error', 'show']);

  beforeEach(async () => {
    authSpy.login.and.returnValue(of({ success: true, data: { requires_2fa: true, user_id: 1, delivery_channel: 'console' } }));
    authSpy.verifyTwoFactor.and.returnValue(of({ success: true, data: { token: 'jwt', usuario: { id: 1, rol_id: 3, rol_nombre: 'ESTUDIANTE' } } }));
    authSpy.resendTwoFactor.and.returnValue(of({ success: true, data: { requires_2fa: true, user_id: 1 } }));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps submit disabled when form is invalid', () => {
    expect(component.form.invalid).toBeTrue();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.auth-submit');
    expect(button.disabled).toBeTrue();
  });

  it('moves to otp step on successful login', () => {
    component.form.setValue({ email: 'demo@demo.local', password: 'Seguro123*' });
    component.submit();
    expect(component.otpStep).toBeTrue();
    expect(authSpy.login).toHaveBeenCalled();
  });
});
