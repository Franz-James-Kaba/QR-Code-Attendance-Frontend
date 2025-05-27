import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface LeaderboardEntry {
  firstName: string;
  lastName: string;
  totalPoints: number;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/admin/points/leaderboard`).pipe(
      map((response: LeaderboardEntry[] | null) => {
        // If we get a 204 No Content response, return an empty array
        if (!response) {
          return [];
        }
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred while fetching leaderboard data.';

        if (error.status === 403) {
          errorMessage = 'You do not have permission to view the leaderboard.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        // Log the error for debugging
        console.error('Error fetching leaderboard:', error);

        // Rethrow as a new error with our custom message
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to view the leaderboard.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
