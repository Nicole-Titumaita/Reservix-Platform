import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('ResetPasswordComponent', () => {
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let component: ResetPasswordComponent;
  const authSpy = jasmine.createSpyObj('AuthService', ['validateResetToken', 'resetPassword']);
  const notificationsSpy = jasmine.createSpyObj('NotificationService', ['error', 'show']);

  beforeEach(async () => {
    authSpy.validateResetToken.and.returnValue(of({ success: true, data: { valid: true } }));
    authSpy.resetPassword.and.returnValue(of({ success: true, message: 'Contrasena actualizada correctamente' }));

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: new Map([['token', 'abc']]) } } },
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('validates the token on init', () => {
    expect(authSpy.validateResetToken).toHaveBeenCalled();
    expect(component.tokenValid).toBeTrue();
  });
});
