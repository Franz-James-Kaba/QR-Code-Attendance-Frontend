import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AuthStep } from '@shared/models/auth/auth.model';
import { AuthActions } from '@store/actions/auth.actions';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;

  const initialState = {
    auth: {
      isLoading: false,
      error: null,
      step: AuthStep.EMAIL,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [provideMockStore({ initialState })],
      schemas: [NO_ERRORS_SCHEMA], // To handle custom components without full implementation
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.forgotPasswordForm.get('email')?.value).toBe('');
    expect(component.forgotPasswordForm.get('otp')?.value).toBe('');
    expect(component.forgotPasswordForm.get('newPassword')?.value).toBe('');
    expect(component.forgotPasswordForm.get('confirmPassword')?.value).toBe('');
  });

  it('should dispatch setAuthStep action on initialization', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.setAuthStep({ step: AuthStep.EMAIL }));
  });

  describe('Email Step', () => {
    beforeEach(async () => {
      store.setState({
        auth: {
          ...initialState.auth,
          step: AuthStep.EMAIL,
        },
      });
      store.refreshState();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should mark email as invalid when using non-AmaliTech email', () => {
      const emailControl = component.forgotPasswordForm.get('email');
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBeFalsy();
    });

    it('should mark email as valid when using AmaliTech email', () => {
      const emailControl = component.forgotPasswordForm.get('email');
      emailControl?.setValue('test@amalitech.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should disable submit button when email is invalid', () => {
      component.forgotPasswordForm.get('email')?.setValue('invalid-email');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('app-button[type="submit"]')).nativeElement;
      expect(button.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should enable submit button when email is valid', async () => {
      component.forgotPasswordForm.get('email')?.setValue('test@amalitech.com');
      component.forgotPasswordForm.get('email')?.updateValueAndValidity();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('app-button[type="submit"]')).nativeElement;
      expect(button.getAttribute('ng-reflect-disabled')).toBe('false');
    });

    it('should dispatch forgotPassword action when form is submitted with valid email', async () => {
      const testEmail = 'test@amalitech.com';
      component.forgotPasswordForm.get('email')?.setValue(testEmail);
      component.forgotPasswordForm.get('email')?.updateValueAndValidity();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Reset the spy to clear previous calls
      dispatchSpy.mockClear();

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Auth] Forgot Password',
          email: testEmail,
        })
      );
    });
  });

  describe('OTP Step', () => {
    beforeEach(async () => {
      store.setState({
        auth: {
          ...initialState.auth,
          step: AuthStep.OTP,
        },
      });
      store.refreshState();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should mark OTP as invalid when less than 6 digits', () => {
      const otpControl = component.forgotPasswordForm.get('otp');
      otpControl?.setValue('12345');
      expect(otpControl?.valid).toBeFalsy();
    });

    it('should mark OTP as invalid when containing non-digits', () => {
      const otpControl = component.forgotPasswordForm.get('otp');
      otpControl?.setValue('12345a');
      expect(otpControl?.valid).toBeFalsy();
    });

    it('should mark OTP as valid when exactly 6 digits', () => {
      const otpControl = component.forgotPasswordForm.get('otp');
      otpControl?.setValue('123456');
      expect(otpControl?.valid).toBeTruthy();
    });

    it('should dispatch verifyOtp action when form is submitted with valid OTP', async () => {
      const testOtp = '123456';
      component.forgotPasswordForm.get('otp')?.setValue(testOtp);
      component.forgotPasswordForm.get('otp')?.updateValueAndValidity();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Reset the spy to clear previous calls
      dispatchSpy.mockClear();

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Auth] Verify OTP',
          otp: testOtp,
        })
      );
    });
  });

  describe('Reset Password Step', () => {
    beforeEach(async () => {
      store.setState({
        auth: {
          ...initialState.auth,
          step: AuthStep.RESET_PASSWORD,
        },
      });
      store.refreshState();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should mark new password as invalid when less than 8 characters', () => {
      const passwordControl = component.forgotPasswordForm.get('newPassword');
      passwordControl?.setValue('1234567');
      expect(passwordControl?.valid).toBeFalsy();
    });

    it('should mark new password as valid when 8 or more characters', () => {
      const passwordControl = component.forgotPasswordForm.get('newPassword');
      passwordControl?.setValue('12345678');
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should show error when passwords do not match', () => {
      component.forgotPasswordForm.get('newPassword')?.setValue('password123');
      component.forgotPasswordForm.get('confirmPassword')?.setValue('password456');
      component.forgotPasswordForm.updateValueAndValidity();

      expect(component.forgotPasswordForm.hasError('passwordMismatch')).toBeTruthy();
    });

    it('should be valid when passwords match', () => {
      const password = 'password123';
      component.forgotPasswordForm.get('newPassword')?.setValue(password);
      component.forgotPasswordForm.get('confirmPassword')?.setValue(password);
      component.forgotPasswordForm.updateValueAndValidity();

      expect(component.forgotPasswordForm.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should dispatch resetPassword action when form is submitted with valid passwords', async () => {
      const password = 'password123';
      component.forgotPasswordForm.get('newPassword')?.setValue(password);
      component.forgotPasswordForm.get('confirmPassword')?.setValue(password);
      component.forgotPasswordForm.updateValueAndValidity();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Reset the spy to clear previous calls
      dispatchSpy.mockClear();

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Auth] Reset Password',
          newPassword: password,
          oldPassword: '',
        })
      );
    });
  });

  it('should show error message when store has an error', async () => {
    const errorMessage = 'Invalid email address';

    store.setState({
      auth: {
        ...initialState.auth,
        error: errorMessage,
      },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(errorElement.nativeElement.textContent.trim()).toBe(errorMessage);
  });

  it('should set loading state on button when isLoading is true', async () => {
    store.setState({
      auth: {
        ...initialState.auth,
        isLoading: true,
      },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button[type="submit"]')).nativeElement;
    expect(button.getAttribute('ng-reflect-loading')).toBe('true');
  });

  it('should display correct heading based on current step', async () => {
    // Email step
    store.setState({
      auth: { ...initialState.auth, step: AuthStep.EMAIL },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    let heading = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(heading.textContent.trim()).toBe('Forgot your password?');

    // OTP step
    store.setState({
      auth: { ...initialState.auth, step: AuthStep.OTP },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    heading = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(heading.textContent.trim()).toBe('Enter verification code');

    // Reset Password step
    store.setState({
      auth: { ...initialState.auth, step: AuthStep.RESET_PASSWORD },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    heading = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(heading.textContent.trim()).toBe('Create new password');
  });

  it('should display correct button text based on current step', async () => {
    const getButtonText = () => {
      const buttonElement = fixture.debugElement.query(By.css('app-button[type="submit"]'));
      return buttonElement ? buttonElement.nativeElement.textContent.trim() : '';
    };

    // Email step
    store.setState({
      auth: { ...initialState.auth, step: AuthStep.EMAIL },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(getButtonText()).toBe('Send Code');

    // OTP step
    store.setState({
      auth: { ...initialState.auth, step: AuthStep.OTP },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(getButtonText()).toBe('Verify Code');

    // Reset Password step
    store.setState({
      auth: { ...initialState.auth, step: AuthStep.RESET_PASSWORD },
    });
    store.refreshState();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(getButtonText()).toBe('Reset Password');
  });
});
