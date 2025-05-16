import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AuthActions } from '@store/states/auth/auth.actions';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;

  const initialState = {
    auth: {
      isLoading: false,
      error: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [provideMockStore({ initialState })],
      schemas: [NO_ERRORS_SCHEMA], // To handle custom components without full implementation
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty email and password', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark email as invalid when using non-AmaliTech email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeFalsy();
  });

  it('should mark email as valid when using AmaliTech email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('test@amalitech.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should mark password as invalid when less than 6 characters', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalsy();
  });

  it('should mark password as valid when 6 or more characters', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    // Set form to invalid state
    component.loginForm.setValue({
      email: 'invalid-email',
      password: '12345',
    });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button')).nativeElement;
    expect(button.getAttribute('ng-reflect-disabled')).toBe('true');
  });

  it('should enable submit button when form is valid', () => {
    component.loginForm.setValue({
      email: 'test@amalitech.com',
      password: '123456',
    });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button')).nativeElement;
    expect(button.getAttribute('ng-reflect-disabled')).toBe('false');
  });

  it('should dispatch login action when form is submitted with valid data', () => {
    const testEmail = 'test@amalitech.com';
    const testPassword = 'password123';

    component.loginForm.setValue({
      email: testEmail,
      password: testPassword,
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.login({
        email: testEmail,
        password: testPassword,
      })
    );
  });

  it('should not dispatch login action when form is invalid', () => {
    component.loginForm.setValue({
      email: 'invalid-email',
      password: '12345',
    });

    component.onSubmit();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should show error message when store has an error', () => {
    const errorMessage = 'Invalid email or password';

    store.setState({
      auth: {
        isLoading: false,
        error: errorMessage,
      },
    });
    store.refreshState();
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(errorElement.nativeElement.textContent.trim()).toBe(errorMessage);
  });

  it('should set loading state on button when isLoading is true', () => {
    store.setState({
      auth: {
        isLoading: true,
        error: null,
      },
    });
    store.refreshState();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button')).nativeElement;
    expect(button.getAttribute('ng-reflect-loading')).toBe('true');
  });
});
