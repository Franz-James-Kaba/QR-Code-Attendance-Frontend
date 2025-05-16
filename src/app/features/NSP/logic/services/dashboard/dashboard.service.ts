import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AWARD_ICON, CALENDER_ICON, CHECK_IN_ICON, CHECK_OUT_ICON } from '@app/core/data/svg-data';
import {
  AttendancePositionResponse,
  AverageTimeResponse,
  CheckInResponse,
  SummaryCard,
} from '@app/features/NSP/models/nsp.interface';
import { environment } from '@environments/environment';
import { forkJoin, map, Observable } from 'rxjs';

import { formatTime } from './../../../../../shared/utils/format-date.util';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http: HttpClient = inject(HttpClient);

  private getAverageTimeData(
    endpoint: string,
    startDate?: string,
    endDate?: string
  ): Observable<AverageTimeResponse> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<AverageTimeResponse>(`${environment.api.baseUrl}/metrics/${endpoint}`, {
      params,
    });
  }

  private getAverageCheckInData(
    startDate?: string,
    endDate?: string
  ): Observable<AverageTimeResponse> {
    return this.getAverageTimeData('average-check-in-time', startDate, endDate);
  }

  private getAverageCheckOutData(
    startDate?: string,
    endDate?: string
  ): Observable<AverageTimeResponse> {
    return this.getAverageTimeData('average-check-out-time', startDate, endDate);
  }

  private getAttendancePosition(): Observable<AttendancePositionResponse> {
    return this.http.get<AttendancePositionResponse>(
      `${environment.api.baseUrl}/attendance/position`
    );
  }

  public getAttendanceSummaryData(): Observable<SummaryCard[]> {
    return forkJoin([
      this.getAverageCheckInData().pipe(
        map(response => ({
          icon: CHECK_IN_ICON,
          title: 'Check In',
          value: formatTime(response.data),
          description: 'Average Check In Time',
        }))
      ),
      this.getAverageCheckOutData().pipe(
        map(response => ({
          icon: CHECK_OUT_ICON,
          title: 'Check Out',
          value: formatTime(response.data),
          description: 'Average Check Out Time',
        }))
      ),
      this.getAttendancePosition().pipe(
        map(response => ({
          icon: AWARD_ICON,
          title: 'Check-In Position',
          value: response.position.toString(),
          description: 'Position on Attendance Table',
        }))
      ),
    ]).pipe(
      map(([checkIn, checkOut, position]) => [
        checkIn,
        checkOut,
        position,
        {
          icon: CALENDER_ICON,
          title: 'Total Days',
          value: '16/28',
          description: 'Working Days',
        },
      ])
    );
  }

  public checkIn(sessionCode: string): Observable<CheckInResponse> {
    return this.http.post<CheckInResponse>(
      `${environment.api.baseUrl}/attendance/check-in?session-code=${encodeURIComponent(sessionCode)}`,
      {}
    );
  }
}
