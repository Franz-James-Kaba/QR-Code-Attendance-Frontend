import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  AverageTimeResponse,
  AttendancePositionResponse,
  AttendanceWorkingDaysResponse,
  CheckInResponse,
  SummaryCard,
} from '@app/features/NSP/models/nsp.interface';
import { formatTime } from '@app/shared/utils/format-date.util';
import { environment } from '@environments/environment';

import { DashboardService } from './dashboard.service';


jest.mock('@app/core/data/svg-data', () => ({
  CHECK_IN_ICON: {
    path: 'M15 9L19 5M19 5L15 1M19 5H6C3.23858 5 1 7.23858 1 10C1 12.7614 3.23858 15 6 15H11',
    viewBox: '0 0 20 16',
    size: 16,
  },
  CHECK_OUT_ICON: {
    path: 'M7 1L3 5M3 5L7 9M3 5H16C18.7614 5 21 7.23858 21 10C21 12.7614 18.7614 15 16 15H11',
    viewBox: '0 0 22 16',
    size: 16,
  },
  AWARD_ICON: {
    path: 'M16 2H14V0H4V2H2C0.9 2 0 2.9 0 4V5C0 7.55 1.92 9.63 4.39 9.94C5.02 11.44 6.37 12.57 8 12.9V16H4V18H14V16H10V12.9C11.63 12.57 12.98 11.44 13.61 9.94C16.08 9.63 18 7.55 18 5V4C18 2.9 17.1 2 16 2ZM2 5V4H4V7.82C2.84 7.4 2 6.3 2 5ZM9 11C7.35 11 6 9.65 6 8V2H12V8C12 9.65 10.65 11 9 11ZM16 5C16 6.3 15.16 7.4 14 7.82V4H16V5Z',
    viewBox: '0 0 18 18',
    size: 18,
  },
  CALENDER_ICON: {
    path: 'M17 3H21V6H3V3H7V1H9V3H15V1H17V3ZM3 8V20H21V8H3ZM15 15H12V12H15V15ZM15 11H12V9H15V11ZM10 15H7V12H10V15ZM10 11H7V9H10V11Z',
    viewBox: '0 0 24 22',
    size: 22,
  },
}));

jest.mock('@app/shared/utils/format-date.util', () => ({
  formatTime: jest.fn(),
}));

jest.mock('@environments/environment', () => ({
  environment: {
    api: {
      baseUrl: 'https://api.example.com',
    },
  },
}));

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch attendance summary data with four summary cards', (done) => {
    const mockDate = new Date('2025-05-20');
    const mockCheckIn: AverageTimeResponse = { data: '08:00:00', message: 'Success' };
    const mockCheckOut: AverageTimeResponse = { data: '17:00:00', message: 'Success' };
    const mockPosition: AttendancePositionResponse = { position: 3, success: true, message: 'Success' };
    const mockWorkingDays: AttendanceWorkingDaysResponse = { workingDays: '20', success: true, message: 'Success' };

    (formatTime as jest.Mock).mockImplementation((time: string | null) =>
      time === '08:00:00' ? '08:00 AM' : '05:00 PM'
    );

    service.getAttendanceSummaryData(mockDate).subscribe((summary: SummaryCard[]) => {
      expect(summary).toHaveLength(4);

      expect(summary[0]).toEqual({
        icon: {
          path: 'M15 9L19 5M19 5L15 1M19 5H6C3.23858 5 1 7.23858 1 10C1 12.7614 3.23858 15 6 15H11',
          viewBox: '0 0 20 16',
          size: 16,
        },
        title: 'Check In',
        value: '08:00 AM',
        description: 'Average Check In Time',
      });

      expect(summary[1]).toEqual({
        icon: {
          path: 'M7 1L3 5M3 5L7 9M3 5H16C18.7614 5 21 7.23858 21 10C21 12.7614 18.7614 15 16 15H11',
          viewBox: '0 0 22 16',
          size: 16,
        },
        title: 'Check Out',
        value: '05:00 PM',
        description: 'Average Check Out Time',
      });

      expect(summary[2]).toEqual({
        icon: {
          path: 'M16 2H14V0H4V2H2C0.9 2 0 2.9 0 4V5C0 7.55 1.92 9.63 4.39 9.94C5.02 11.44 6.37 12.57 8 12.9V16H4V18H14V16H10V12.9C11.63 12.57 12.98 11.44 13.61 9.94C16.08 9.63 18 7.55 18 5V4C18 2.9 17.1 2 16 2ZM2 5V4H4V7.82C2.84 7.4 2 6.3 2 5ZM9 11C7.35 11 6 9.65 6 8V2H12V8C12 9.65 10.65 11 9 11ZM16 5C16 6.3 15.16 7.4 14 7.82V4H16V5Z',
          viewBox: '0 0 18 18',
          size: 18,
        },
        title: 'Check-In Position',
        value: '3',
        description: 'Position on Attendance Table',
      });

      expect(summary[3]).toEqual({
        icon: {
          path: 'M17 3H21V6H3V3H7V1H9V3H15V1H17V3ZM3 8V20H21V8H3ZM15 15H12V12H15V15ZM15 11H12V9H15V11ZM10 15H7V12H10V15ZM10 11H7V9H10V11Z',
          viewBox: '0 0 24 22',
          size: 22,
        },
        title: 'Total Days',
        value: '20',
        description: 'Working Days',
      });

      done();
    });

    const endDate = '2025-05-20';
    const req1 = httpMock.expectOne(`${environment.api.baseUrl}/metrics/average-check-in-time?endDate=${endDate}`);
    expect(req1.request.method).toBe('GET');
    req1.flush(mockCheckIn);

    const req2 = httpMock.expectOne(`${environment.api.baseUrl}/metrics/average-check-out-time?endDate=${endDate}`);
    expect(req2.request.method).toBe('GET');
    req2.flush(mockCheckOut);

    const req3 = httpMock.expectOne(`${environment.api.baseUrl}/attendance/position`);
    expect(req3.request.method).toBe('GET');
    req3.flush(mockPosition);

    const req4 = httpMock.expectOne(`${environment.api.baseUrl}/attendance/working-days`);
    expect(req4.request.method).toBe('GET');
    req4.flush(mockWorkingDays);
  });

  it('should handle 404 error for attendance position', (done) => {
    const mockDate = new Date('2025-05-20');
    const mockCheckIn: AverageTimeResponse = { data: '08:00:00', message: 'Success' };
    const mockCheckOut: AverageTimeResponse = { data: '17:00:00', message: 'Success' };
    const mockWorkingDays: AttendanceWorkingDaysResponse = { workingDays: '20', success: true, message: 'Success' };

    (formatTime as jest.Mock).mockImplementation((time: string | null) =>
      time === '08:00:00' ? '08:00 AM' : '05:00 PM'
    );

    service.getAttendanceSummaryData(mockDate).subscribe((summary: SummaryCard[]) => {
      expect(summary).toHaveLength(4);

      expect(summary[2]).toEqual({
        icon: {
          path: 'M16 2H14V0H4V2H2C0.9 2 0 2.9 0 4V5C0 7.55 1.92 9.63 4.39 9.94C5.02 11.44 6.37 12.57 8 12.9V16H4V18H14V16H10V12.9C11.63 12.57 12.98 11.44 13.61 9.94C16.08 9.63 18 7.55 18 5V4C18 2.9 17.1 2 16 2ZM2 5V4H4V7.82C2.84 7.4 2 6.3 2 5ZM9 11C7.35 11 6 9.65 6 8V2H12V8C12 9.65 10.65 11 9 11ZM16 5C16 6.3 15.16 7.4 14 7.82V4H16V5Z',
          viewBox: '0 0 18 18',
          size: 18,
        },
        title: 'Check-In Position',
        value: 'N/A',
        description: 'Not checked in today',
      });

      done();
    });

    const endDate = '2025-05-20';
    httpMock.expectOne(`${environment.api.baseUrl}/metrics/average-check-in-time?endDate=${endDate}`).flush(mockCheckIn);
    httpMock.expectOne(`${environment.api.baseUrl}/metrics/average-check-out-time?endDate=${endDate}`).flush(mockCheckOut);
    httpMock
      .expectOne(`${environment.api.baseUrl}/attendance/position`)
      .error(new ErrorEvent('error', { message: 'Not Found' }), { status: 404 });
    httpMock.expectOne(`${environment.api.baseUrl}/attendance/working-days`).flush(mockWorkingDays);
  });

  it('should perform check-in with POST request', (done) => {
    const sessionCode = 'test-session';
    const mockResponse: CheckInResponse = { success: true, message: 'Check-in successful' };

    service.checkIn(sessionCode).subscribe((response: CheckInResponse) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(
      `${environment.api.baseUrl}/attendance/check-in?session-code=${encodeURIComponent(sessionCode)}`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should perform check-out with PUT request', (done) => {
    const sessionCode = 'test-session';
    const mockResponse: CheckInResponse = { success: true, message: 'Check-out successful' };

    service.checkOut(sessionCode).subscribe((response: CheckInResponse) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(
      `${environment.api.baseUrl}/attendance/check-out?session-code=${encodeURIComponent(sessionCode)}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });
});
