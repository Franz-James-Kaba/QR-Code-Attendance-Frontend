import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { SummaryCard } from '@app/features/NSP/models/nsp.interface';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  selectAttendanceSummary,
  selectIsCheckedIn,
  selectError,
} from '@store/selectors/attendance.selectors';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { DashboardComponent } from './dashboard.component';


@Injectable()
class AuthServiceStub {
  getUserProfile() {
    return { subscribe: jest.fn() };
  }
}

@Component({
  selector: 'app-profile',
  standalone: true,
  template: '',
})
class ProfileStubComponent {}

@Component({
  selector: 'app-calender',
  standalone: true,
  template: '',
})
class CalenderStubComponent {}

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  template: '',
})
class AttendanceSummaryStubComponent {
  @Input() attendanceSummary: SummaryCard[] = [];
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  template: '',
})
class ActivityListStubComponent {}

@Component({
  selector: 'app-slide-button',
  standalone: true,
  template: '',
})
class SlideButtonStubComponent {
  @Input() isCheckedIn = false;
  @Input() disabled = false;
  @Output() scanRequested = new EventEmitter<void>();
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: MockStore;
  let httpMock: HttpTestingController;
  let dispatchSpy: jest.SpyInstance;

  const mockSummary: SummaryCard[] = [
    {
      icon: {
        path: 'M15 9L19 5M19 5L15 1M19 5H6C3.23858 5 1 7.23858 1 10C1 12.7614 3.23858 15 6 15H11',
        viewBox: '0 0 20 16',
        size: 16,
      },
      title: 'Check In',
      value: '08:00 AM',
      description: 'Average Check In Time',
    },
  ];

  beforeEach(waitForAsync(async () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: jest.fn(),
      writable: true,
    });

    const mockActiveElement = document.createElement('div');
    mockActiveElement.scrollIntoView = jest.fn();
    Object.defineProperty(document, 'activeElement', {
      value: mockActiveElement,
      writable: true,
    });

    const mockMediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      }),
      enumerateDevices: jest.fn().mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Front Camera', groupId: 'group1' },
        { deviceId: '2', kind: 'videoinput', label: 'Back Camera', groupId: 'group2' },
      ]),
    };
    Object.defineProperty(navigator, 'mediaDevices', {
      value: mockMediaDevices,
      writable: true,
    });

    Object.defineProperty(navigator, 'permissions', {
      value: {
        query: jest.fn().mockResolvedValue({ state: 'granted' }),
      },
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        ZXingScannerModule,
        DashboardComponent,
        ProfileStubComponent,
        CalenderStubComponent,
        AttendanceSummaryStubComponent,
        ActivityListStubComponent,
        SlideButtonStubComponent,
      ],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAttendanceSummary, value: null },
            { selector: selectIsCheckedIn, value: false },
            { selector: selectError, value: null },
          ],
        }),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: 'AuthService', useClass: AuthServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    component.isLoading = false;
    component.isProcessing.set(false);
    store = TestBed.inject(MockStore);
    httpMock = TestBed.inject(HttpTestingController);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    fixture.detectChanges();
    await fixture.whenStable();
  }));

  afterEach(() => {
    try {
      fixture.destroy();
      httpMock.verify();
    } catch (e) {
      console.error('Cleanup error:', e);
    }
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set error message if camera permission is denied', async () => {
    (navigator.permissions.query as jest.Mock).mockResolvedValue({ state: 'denied' });
    await component.startQRScanner();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isScanning()).toBe(false);
    expect(component.errorMessage()).toBe(
      'Camera access denied. Please allow camera access in your browser settings.'
    );

    const errorElement = fixture.debugElement.query(By.css('.error-message'));
    expect(errorElement).toBeNull();
  });

  it('should stop QR scanner and reset state', async () => {
    component.isScanning.set(true);
    component.torchEnabled.set(true);
    component.errorMessage.set('Some error');
    component.stopQRScanner();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isScanning()).toBe(false);
    expect(component.torchEnabled()).toBe(false);
    expect(component.errorMessage()).toBe(null);

    const scanner = fixture.debugElement.query(By.css('zxing-scanner'));
    expect(scanner).toBeNull();
  });

  it('should toggle torch state', async () => {
    component.torchEnabled.set(false);
    component.toggleTorch();
    expect(component.torchEnabled()).toBe(true);

    component.toggleTorch();
    expect(component.torchEnabled()).toBe(false);

    component.isScanning.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const scanner = fixture.debugElement.query(By.css('zxing-scanner'));
    expect(scanner.attributes['ng-reflect-torch']).toBe('false');
  });

  it('should set error message on scan error', async () => {
    component.isScanning.set(true);
    component.onScanError(new Error('Scan failed'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe(
      'Error scanning QR code. Please try again or ensure the QR code is visible.'
    );

    const errorElement = fixture.debugElement.query(By.css('.error-message'));
    expect(errorElement.nativeElement.textContent).toBe(
      'Error scanning QR code. Please try again or ensure the QR code is visible.'
    );
  });

  it('should update available devices and select back camera on cameras found', async () => {
    const devices: MediaDeviceInfo[] = [
      { deviceId: '1', kind: 'videoinput', label: 'Front Camera', groupId: 'group1' } as MediaDeviceInfo,
      { deviceId: '2', kind: 'videoinput', label: 'Back Camera', groupId: 'group2' } as MediaDeviceInfo,
    ];
    component.onCamerasFound(devices);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.availableDevices()).toEqual(devices);
    expect(component.selectedDevice()?.label).toBe('Back Camera');

    component.isScanning.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const select = fixture.debugElement.query(By.css('select'));
    expect(select.children.length).toBe(2);
  });

  it('should render loading state when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(loadingElement.textContent).toBe('Loading profile...');
    expect(fixture.debugElement.query(By.directive(AttendanceSummaryStubComponent))).toBeNull();
  });

  it('should render scanner UI when isScanning is true', async () => {
    component.isScanning.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const scanner = fixture.debugElement.query(By.css('zxing-scanner'));
    expect(scanner).toBeTruthy();
    expect(scanner.attributes['ng-reflect-enable']).toBe('true');
    expect(scanner.attributes['ng-reflect-formats']).toBe('11');
  });

});
