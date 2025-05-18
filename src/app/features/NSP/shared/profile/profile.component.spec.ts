import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BELL_ICON } from '@app/core/data/svg-data';
import { AuthService } from '@app/core/services/auth/auth.service';
import { IconComponent } from '@app/shared/components/icon/icon.component';
import { UserBadgeComponent } from '@app/shared/components/user-badge/user-badge.component';
import { ExtendedAuthResponse } from '@app/shared/models/auth/auth.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { ProfileComponent } from './profile.component';

@Component({
  selector: 'app-icon',
  template: '',
})
class MockIconComponent {
  @Input() path: string = '';
  @Input() viewBox: string = '';
  @Input() size: number = 0;
  @Input() strokeColor: string = '';
}

class MockAuthService {
  private userSubject = new BehaviorSubject<ExtendedAuthResponse | null>(null);
  currentUser$: Observable<ExtendedAuthResponse | null> = this.userSubject.asObservable();

  setUser(user: ExtendedAuthResponse | null): void {
    this.userSubject.next(user);
  }
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      imports: [CommonModule, ProfileComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideComponent(ProfileComponent, {
        set: {
          imports: [CommonModule, UserBadgeComponent, IconComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;

    component.bellIcon = BELL_ICON;

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading message when user is null', () => {
    mockAuthService.setUser(null);
    fixture.detectChanges();

    const loadingElement = fixture.nativeElement.querySelector('p');
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.textContent).toBe('Loading profile...');

    const userBadge = fixture.nativeElement.querySelector('app-user-badge');
    expect(userBadge).toBeNull();
  });

  it('should display user badge with correct inputs when user is loaded', fakeAsync(() => {
    const mockUser: ExtendedAuthResponse = {
      token: 'abc123',
      email: 'test@example.com',
      role: 'ADMIN',
      passwordResetRequired: false,
      firstName: 'John',
      lastName: 'Doe',
      checkedIn: true,
    };

    mockAuthService.setUser(mockUser);
    fixture.detectChanges();
    tick();

    const userBadge = fixture.nativeElement.querySelector('app-user-badge');
    expect(userBadge).toBeTruthy();

    expect(userBadge.getAttribute('ng-reflect-first-name')).toBe('John');
    expect(userBadge.getAttribute('ng-reflect-last-name')).toBe('Doe');
    expect(userBadge.getAttribute('ng-reflect-user-role')).toBe('ADMIN');
    expect(userBadge.getAttribute('ng-reflect-checked-in')).toBe('true');
    expect(userBadge.getAttribute('ng-reflect-status')).toBe('online');

    const loadingElement = fixture.nativeElement.querySelector('p');
    expect(loadingElement).toBeNull();
  }));

  it('should display user badge with default values for undefined fields', fakeAsync(() => {
    const mockUser: ExtendedAuthResponse = {
      token: 'abc123',
      email: 'test@example.com',
      role: 'FACILITATOR',
      passwordResetRequired: false,
    };

    mockAuthService.setUser(mockUser);
    fixture.detectChanges();
    tick();

    const userBadge = fixture.nativeElement.querySelector('app-user-badge');
    expect(userBadge).toBeTruthy();

    expect(userBadge.getAttribute('ng-reflect-first-name')).toBe('');
    expect(userBadge.getAttribute('ng-reflect-last-name')).toBe('');
    expect(userBadge.getAttribute('ng-reflect-user-role')).toBe('FACILITATOR');
    expect(userBadge.getAttribute('ng-reflect-checked-in')).toBe('false');
    expect(userBadge.getAttribute('ng-reflect-status')).toBe('offline');
  }));

  it('should render bell icon with correct properties', () => {
    const iconElement = fixture.debugElement.query(By.css('app-icon'))
      .componentInstance as MockIconComponent;
    expect(iconElement).toBeTruthy();

    expect(iconElement.path).toBe(BELL_ICON.path);
    expect(iconElement.viewBox).toBe(BELL_ICON.viewBox);
    expect(iconElement.size).toBe(BELL_ICON.size);
    expect(iconElement.strokeColor).toBe('nspText');
  });

  it('should use AuthService currentUser$ observable', () => {
    expect(mockAuthService.currentUser$).toBe(component.user$);
  });
});
