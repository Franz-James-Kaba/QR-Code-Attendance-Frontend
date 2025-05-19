import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

import { NSPImportResult, NSPRequest, NSPResponse, NSPViewModel, PagedResponse, mapToViewModel } from '../models/nsp.model';

@Injectable({
  providedIn: 'root'
})
export class NspService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Create a new NSP user
   */
  createNsp(nsp: NSPRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/admin/create-nsp`, nsp, {
      responseType: 'text' as 'json' // Handle text response correctly
    })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get all NSPs with pagination
   */
  getAllNsps(page = 0, size = 10): Observable<{data: NSPViewModel[], total: number}> {
    // Convert to 1-based pagination for the backend API
    // The backend expects page to start at 1, not 0
    const pageIndexForBackend = Math.max(1, page + 1);
    
    // Create new HttpParams using set() method to ensure proper URL encoding
    let params = new HttpParams();
    params = params.set('page', pageIndexForBackend.toString());
    params = params.set('size', size.toString());

    // Log the actual request parameters for debugging
    console.log('Making NSP API request with params:', { page: pageIndexForBackend, size });

    return this.http.get<PagedResponse<NSPResponse>>(`${this.apiUrl}/admin/users/nsps`, { params })
      .pipe(
        map(response => ({
          data: response.content.map(nsp => mapToViewModel(nsp)),
          total: response.totalElements
        })),
        catchError(error => {
          console.error('Error in getAllNsps:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get NSP by email
   */
  getNspByEmail(email: string): Observable<NSPViewModel> {
    const params = new HttpParams().set('email', email);

    return this.http.get<NSPResponse>(`${this.apiUrl}/admin/users`, { params })
      .pipe(
        map(response => mapToViewModel(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update existing NSP
   */
  updateNsp(userId: number, nsp: NSPRequest): Observable<NSPViewModel> {
    return this.http.put<NSPResponse>(`${this.apiUrl}/admin/users/${userId}`, nsp)
      .pipe(
        map(response => mapToViewModel(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete NSP
   */
  deleteNsp(userId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/admin/users/${userId}`, {
      responseType: 'text' as 'json' // Handle text response correctly
    })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Bulk import NSPs
   * This is a custom endpoint that would need to be implemented on the backend
   */
  bulkImportNsps(nsps: NSPRequest[]): Observable<NSPImportResult> {
    return this.http.post<NSPImportResult>(`${this.apiUrl}/admin/bulk-create-nsps`, nsps)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Error handling
   */
  private handleError(error: Error | { status: number; error?: { message?: string }; statusText: string }): Observable<never> {
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
          errorMessage = 'Forbidden: You don\'t have permission to perform this action';
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
