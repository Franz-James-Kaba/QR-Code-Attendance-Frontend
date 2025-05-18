import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AWARD_ICON, CALENDER_ICON, CHECK_IN_ICON, CHECK_OUT_ICON } from '@app/core/data/svg-data';
import {
  AttendancePositionResponse,
  AverageTimeResponse,
  CheckInResponse,
  SummaryCard,
} from '@app/features/NSP/models/nsp.interface';
import { formatTime } from '@app/shared/utils/format-date.util';
import { environment } from '@environments/environment';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http: HttpClient = inject(HttpClient);

  private getAverageTimeData(
    endpoint: string,
    endDate?: string
  ): Observable<AverageTimeResponse> {
    let params = new HttpParams();

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<AverageTimeResponse>(`${environment.api.baseUrl}/metrics/${endpoint}`, {
      params,
    });
  }

  private getAverageCheckInData(endDate?: string): Observable<AverageTimeResponse> {
    return this.getAverageTimeData('average-check-in-time', endDate);
  }

  private getAverageCheckOutData(endDate?: string): Observable<AverageTimeResponse> {
    return this.getAverageTimeData('average-check-out-time', endDate);
  }

  private getAttendancePosition(): Observable<SummaryCard> {
    return this.http.get<AttendancePositionResponse>(
      `${environment.api.baseUrl}/attendance/position`
    ).pipe(
      map(response => ({
        icon: AWARD_ICON,
        title: 'Check-In Position',
        value: response.position.toString(),
        description: 'Position on Attendance Table',
      })),
      catchError(error => {
        if (error.status === 404) {
          return of({
            icon: AWARD_ICON,
            title: 'Check-In Position',
            value: 'N/A',
            description: 'Not checked in today',
          });
        }
        throw error;
      })
    );
  }

  public getAttendanceSummaryData(date?: Date): Observable<SummaryCard[]> {
    const endDate = date ? date.toISOString().split('T')[0] : undefined;

    return forkJoin([
      this.getAverageCheckInData(endDate).pipe(
        map(response => ({
          icon: CHECK_IN_ICON,
          title: 'Check In',
          value: formatTime(response.data),
          description: 'Average Check In Time',
        }))
      ),
      this.getAverageCheckOutData(endDate).pipe(
        map(response => ({
          icon: CHECK_OUT_ICON,
          title: 'Check Out',
          value: formatTime(response.data),
          description: 'Average Check Out Time',
        }))
      ),
      this.getAttendancePosition(),
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

  public checkOut(sessionCode: string): Observable<CheckInResponse> {
    return this.http.put<CheckInResponse>(
      `${environment.api.baseUrl}/attendance/check-out?session-code=${encodeURIComponent(sessionCode)}`,
      {}
    );
  }
}
