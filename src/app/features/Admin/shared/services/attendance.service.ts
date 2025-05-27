import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';

import { Attendee, EarlyAttendeeResponse, mapToAttendeeViewModel } from '../models/attendee.interface';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://54.172.108.21';
  private readonly timeoutDuration = 10000; // 10 seconds timeout

  /**
   * Get early attendees from the API for a specific date
   * @param date The date to get early attendees for (format: YYYY-MM-DD)
   * @returns Observable of early attendees
   */
  getEarlyAttendees(date: string): Observable<Attendee[]> {
    const params = new HttpParams().set('date', date);

    return this.http
      .get<EarlyAttendeeResponse[]>(`${this.apiUrl}/api/admin/early-attendees`, {
        params,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      .pipe(
        timeout(this.timeoutDuration),
        map(attendees => attendees.map(mapToAttendeeViewModel)),
        catchError(this.handleError)
      );
  }

  /**
   * Grant reception privilege to a facilitator
   * @param email The email of the facilitator
   */
  grantReceptionPrivilege(email: string): Observable<{ message: string; success: boolean }> {
    return this.http
      .post<{ message: string; success: boolean }>(`${this.apiUrl}/api/admin/grant-reception-privilege/${email}`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handling for HTTP requests
   */
  private handleError(
    error: Error | { status: number; error?: { message?: string }; statusText: string }
  ): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error instanceof Error && error.name === 'TimeoutError') {
      errorMessage = 'Request timed out. Please try again.';
    } else if ('error' in error && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if ('status' in error) {
      // Server-side error
      const status = error.status;
      const message = error.error?.message ?? error.statusText;

      switch (status) {
        case 400:
          errorMessage = `Bad Request: ${message}`;
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in again';
          break;
        case 403:
          errorMessage = "Forbidden: You don't have permission to perform this action";
          break;
        case 404:
          errorMessage = `Not Found: ${message}`;
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
        case 0:
          errorMessage = 'Network Error: Unable to connect to the server';
          break;
        default:
          errorMessage = `Error ${status}: ${message}`;
          break;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
