import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

import {
  FacilitatorImportResult,
  FacilitatorRequest,
  FacilitatorResponse,
  FacilitatorViewModel,
  PagedResponse,
  mapToViewModel,
} from '../models/facilitator.model';

@Injectable({
  providedIn: 'root',
})
export class FacilitatorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Create a new facilitator user
   */
  createFacilitator(facilitator: FacilitatorRequest): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/admin/create-facilitator`, facilitator, {
        responseType: 'text' as 'json', // Handle text response correctly
      })
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Get all facilitators with pagination
   */
  getAllFacilitators(
    page = 0,
    size = 10
  ): Observable<{ data: FacilitatorViewModel[]; total: number }> {
    // Convert to 1-based pagination for the backend API
    // The backend expects page to start at 1, not 0
    const pageIndexForBackend = page; // Use 0-based indexing as the API actually expects

    // Create new HttpParams using set() method to ensure proper URL encoding
    let params = new HttpParams();
    params = params.set('page', pageIndexForBackend.toString());
    params = params.set('size', size.toString());

    // Log the actual request parameters for debugging
    console.log('Making Facilitator API request with params:', { page: pageIndexForBackend, size });

    return this.http
      .get<
        PagedResponse<FacilitatorResponse>
      >(`${this.apiUrl}/admin/users/facilitators`, { params })
      .pipe(
        map(response => {
          console.log('API response:', response); // Add debug logging
          return {
            data: response.content.map(facilitator => mapToViewModel(facilitator)),
            total: response.totalElements,
          };
        }),
        catchError(error => {
          console.error('Error in getAllFacilitators:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get facilitator by email
   */
  getFacilitatorByEmail(email: string): Observable<FacilitatorViewModel> {
    const params = new HttpParams().set('email', email);

    return this.http.get<FacilitatorResponse>(`${this.apiUrl}/admin/users`, { params }).pipe(
      map(response => mapToViewModel(response)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Update existing facilitator
   */
  updateFacilitator(
    userId: number,
    facilitator: FacilitatorRequest
  ): Observable<FacilitatorViewModel> {
    return this.http
      .put<FacilitatorResponse>(`${this.apiUrl}/admin/users/${userId}`, facilitator)
      .pipe(
        map(response => mapToViewModel(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete facilitator
   */
  deleteFacilitator(userId: number): Observable<string> {
    return this.http
      .delete<string>(`${this.apiUrl}/admin/users/${userId}`, {
        responseType: 'text' as 'json', // Handle text response correctly
      })
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Bulk import facilitators
   * This is a custom endpoint that would need to be implemented on the backend
   */
  bulkImportFacilitators(facilitators: FacilitatorRequest[]): Observable<FacilitatorImportResult> {
    return this.http
      .post<FacilitatorImportResult>(`${this.apiUrl}/admin/bulk-create-facilitators`, facilitators)
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Grant reception privilege to a facilitator
   * @param email The email address of the facilitator
   * @returns Observable of the operation result
   */
  grantReceptionPrivilege(email: string): Observable<string> {
    return this.http
      .post<string>(
        `${this.apiUrl}/admin/grant-reception-privilege/${email}`,
        {},
        {
          responseType: 'text' as 'json', // Handle text response correctly
        }
      )
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Revoke reception privilege from a facilitator
   * @param email The email address of the facilitator
   * @returns Observable of the operation result
   */
  revokeReceptionPrivilege(email: string): Observable<string> {
    return this.http
      .post<string>(
        `${this.apiUrl}/admin/revoke-reception-privilege/${email}`,
        {},
        {
          responseType: 'text' as 'json', // Handle text response correctly
        }
      )
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Error handling
   */
  private handleError(
    error: Error | { status: number; error?: { message?: string }; statusText: string }
  ): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if ('error' in error && error.error instanceof ErrorEvent) {
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
        default:
          errorMessage = `Error ${status}: ${message}`;
          break;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
