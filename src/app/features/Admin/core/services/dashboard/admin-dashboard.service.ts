import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DashboardResponse } from '@features/Admin/shared/models/dashboard/dashboard.model';
import { Observable, throwError, catchError, map } from 'rxjs';

import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private readonly API_URL = `${environment.admin.baseUrl}/dashboard`;
  private readonly http = inject(HttpClient)

  /**
   * Get dashboard statistics and recent activities
   */
  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get dashboard statistics for a specific date range
   */
  getDashboardDataByDateRange(startDate: string, endDate: string): Observable<DashboardResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DashboardResponse>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get recent activities
   */
  getRecentActivities(limit: number = 10): Observable<DashboardResponse['recentActivities']> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<DashboardResponse>(
      `${this.API_URL}/recent-activities`,
      { params }
    ).pipe(
      map(response => response.recentActivities),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 401) {
      // Server-side error
      errorMessage = 'Unauthorized. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to access dashboard data.';
    } else if (error.status === 404) {
      errorMessage = 'Dashboard data not found.';
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
